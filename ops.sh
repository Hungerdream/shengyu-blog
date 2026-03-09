#!/bin/bash
# ─────────────────────────────────────────
#  声屿笺 运维工具 ops.sh
#  用法: bash ops.sh
# ─────────────────────────────────────────

APP_DIR=~/fullstack-app
SERVICES=(nginx frontend backend db)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

cd "$APP_DIR" || { echo -e "${RED}找不到 $APP_DIR${NC}"; exit 1; }

# ── 工具函数 ──────────────────────────────

header() {
  echo ""
  echo -e "${CYAN}${BOLD}━━━ $1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

ok()   { echo -e "  ${GREEN}✓${NC}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "  ${RED}✗${NC}  $1"; }
info() { echo -e "  ${GRAY}→${NC}  $1"; }

press_any() {
  echo ""
  echo -e "${GRAY}  按任意键返回主菜单...${NC}"
  read -n1 -s
}

# ── 功能 1：容器状态总览 ──────────────────

check_status() {
  header "容器状态"
  for svc in "${SERVICES[@]}"; do
    container="app_${svc}"
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}—{{end}}' "$container" 2>/dev/null)

    if [ "$status" = "running" ]; then
      if [ "$health" = "unhealthy" ]; then
        warn "$container  运行中 但 health=unhealthy"
      else
        ok "$container  运行中${health:+  (health: $health)}"
      fi
    else
      err "$container  状态异常: ${status:-未找到}"
    fi
  done

  echo ""
  header "端口监听"
  for port in 80 443; do
    if ss -tlnp | grep -q ":${port} "; then
      ok "端口 $port 正在监听"
    else
      err "端口 $port 未监听"
    fi
  done

  echo ""
  header "HTTPS 证书"
  subject=$(echo | openssl s_client -connect emdream.icu:443 2>/dev/null | openssl x509 -noout -subject -enddate 2>/dev/null)
  if echo "$subject" | grep -q "emdream.icu"; then
    ok "证书正常"
    info "$(echo "$subject" | grep notAfter | sed 's/notAfter=/到期时间: /')"
  else
    err "证书异常或无法连接"
  fi

  press_any
}

# ── 功能 2：日志查看 ──────────────────────

view_logs() {
  header "查看日志"
  echo ""
  echo -e "  选择容器："
  echo -e "  ${BOLD}1${NC}  nginx"
  echo -e "  ${BOLD}2${NC}  backend"
  echo -e "  ${BOLD}3${NC}  frontend"
  echo -e "  ${BOLD}4${NC}  db"
  echo -e "  ${BOLD}0${NC}  返回"
  echo ""
  read -p "  > " choice

  case $choice in
    1) svc=nginx ;;
    2) svc=backend ;;
    3) svc=frontend ;;
    4) svc=db ;;
    0) return ;;
    *) warn "无效选项"; press_any; return ;;
  esac

  echo ""
  read -p "  显示最近多少行？[默认50] " lines
  lines=${lines:-50}

  header "app_${svc} 最近 ${lines} 行日志"
  docker compose logs --tail="$lines" "$svc"
  press_any
}

# ── 功能 3：一键排错 ─────────────────────

quick_debug() {
  header "一键排错"
  echo ""
  FOUND=0

  # 检查容器是否有挂掉的
  for svc in "${SERVICES[@]}"; do
    container="app_${svc}"
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    if [ "$status" != "running" ]; then
      err "容器 $container 未运行 (status: ${status:-未找到})"
      FOUND=1
    fi
  done

  # 提取各容器最近的 ERROR/WARN 日志
  for svc in "${SERVICES[@]}"; do
    errors=$(docker compose logs --tail=100 "$svc" 2>/dev/null | grep -iE "error|warn|fatal|exception|panic" | tail -5)
    if [ -n "$errors" ]; then
      echo ""
      warn "[$svc] 发现关键日志："
      echo "$errors" | while IFS= read -r line; do
        echo -e "    ${GRAY}$line${NC}"
      done
      FOUND=1
    fi
  done

  # 检查 HTTPS 是否正常
  cert_issuer=$(echo | openssl s_client -connect emdream.icu:443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null)
  if echo "$cert_issuer" | grep -qi "traefik\|self"; then
    err "HTTPS 证书异常：疑似 Traefik 劫持或自签名证书"
    info "尝试：sudo kubectl -n kube-system scale deployment traefik --replicas=0"
    FOUND=1
  fi

  # 检查 iptables 是否有 Traefik 劫持
  if sudo iptables -t nat -L -n 2>/dev/null | grep -q "traefik"; then
    err "iptables 中发现 Traefik 规则，443 端口可能被劫持"
    info "尝试：sudo kubectl -n kube-system delete daemonset svclb-traefik"
    FOUND=1
  fi

  # 检查磁盘空间
  disk_usage=$(df / | awk 'NR==2{print $5}' | tr -d '%')
  if [ "$disk_usage" -ge 85 ]; then
    warn "磁盘使用率 ${disk_usage}%，注意空间不足"
    FOUND=1
  else
    ok "磁盘空间正常 (${disk_usage}% 已用)"
  fi

  echo ""
  if [ "$FOUND" -eq 0 ]; then
    ok "未发现明显问题，一切正常 🎉"
  fi

  press_any
}

# ── 功能 4：服务重启 ──────────────────────

restart_service() {
  header "重启服务"
  echo ""
  echo -e "  ${BOLD}1${NC}  重启 nginx"
  echo -e "  ${BOLD}2${NC}  重启 backend"
  echo -e "  ${BOLD}3${NC}  重启 frontend"
  echo -e "  ${BOLD}4${NC}  重启全部"
  echo -e "  ${BOLD}0${NC}  返回"
  echo ""
  read -p "  > " choice

  case $choice in
    1) svc=nginx ;;
    2) svc=backend ;;
    3) svc=frontend ;;
    4) svc=all ;;
    0) return ;;
    *) warn "无效选项"; press_any; return ;;
  esac

  echo ""
  if [ "$svc" = "all" ]; then
    info "重启所有容器..."
    docker compose restart
  else
    info "重启 $svc..."
    docker compose restart "$svc"
  fi
  echo ""
  ok "完成"
  press_any
}

# ── 主菜单 ────────────────────────────────

main_menu() {
  while true; do
    clear
    echo ""
    echo -e "${BOLD}${CYAN}  声屿笺 运维工具${NC}"
    echo -e "${GRAY}  $(date '+%Y-%m-%d %H:%M:%S')  |  $APP_DIR${NC}"
    echo ""
    echo -e "  ${BOLD}1${NC}  容器状态总览"
    echo -e "  ${BOLD}2${NC}  查看日志"
    echo -e "  ${BOLD}3${NC}  一键排错"
    echo -e "  ${BOLD}4${NC}  重启服务"
    echo -e "  ${BOLD}q${NC}  退出"
    echo ""
    read -p "  选择 > " opt

    case $opt in
      1) check_status ;;
      2) view_logs ;;
      3) quick_debug ;;
      4) restart_service ;;
      q|Q) echo ""; exit 0 ;;
      *) ;;
    esac
  done
}

main_menu
