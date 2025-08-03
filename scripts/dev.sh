#!/bin/bash

# Development script for managing the network diagram editor process

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"
DEFAULT_PORT=3001

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to get PID from port
get_pid_from_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null
}

# Function to stop the dev server
stop_server() {
    echo -e "${YELLOW}Stopping development server...${NC}"
    
    # First try to stop using saved PID
    if [ -f "$PID_FILE" ]; then
        local saved_pid=$(cat "$PID_FILE")
        if kill -0 $saved_pid 2>/dev/null; then
            echo -e "${GREEN}Stopping process with PID $saved_pid${NC}"
            kill -TERM $saved_pid
            sleep 2
            # Force kill if still running
            if kill -0 $saved_pid 2>/dev/null; then
                kill -9 $saved_pid
            fi
            rm -f "$PID_FILE"
            echo -e "${GREEN}Server stopped${NC}"
            return 0
        fi
    fi
    
    # Check default port
    if check_port $DEFAULT_PORT; then
        local pid=$(get_pid_from_port $DEFAULT_PORT)
        if [ ! -z "$pid" ]; then
            echo -e "${YELLOW}Found process on port $DEFAULT_PORT (PID: $pid)${NC}"
            kill -9 $pid
            echo -e "${GREEN}Process killed${NC}"
        fi
    fi
    
    rm -f "$PID_FILE"
}

# Function to start the dev server
start_server() {
    local port=${1:-$DEFAULT_PORT}
    
    # Check if port is already in use
    if check_port $port; then
        echo -e "${RED}Port $port is already in use${NC}"
        local pid=$(get_pid_from_port $port)
        echo -e "${YELLOW}Process using port $port: PID $pid${NC}"
        echo -e "${YELLOW}Use './scripts/dev.sh stop' to stop it first${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Starting development server on port $port...${NC}"
    cd "$PROJECT_ROOT"
    
    # Start the server in background and save PID
    PORT=$port npm start > /dev/null 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    echo -e "${GREEN}Server started with PID $pid${NC}"
    echo -e "${GREEN}Access the application at: http://localhost:$port${NC}"
    echo -e "${YELLOW}Use './scripts/dev.sh stop' to stop the server${NC}"
}

# Function to restart the dev server
restart_server() {
    stop_server
    sleep 2
    start_server $1
}

# Function to check server status
check_status() {
    if [ -f "$PID_FILE" ]; then
        local saved_pid=$(cat "$PID_FILE")
        if kill -0 $saved_pid 2>/dev/null; then
            echo -e "${GREEN}Development server is running (PID: $saved_pid)${NC}"
            
            # Find which port it's using
            local ports=$(lsof -p $saved_pid -P -n | grep LISTEN | grep -E 'TCP \*:([0-9]+)' | awk '{print $9}' | cut -d: -f2 | sort -u)
            if [ ! -z "$ports" ]; then
                echo -e "${GREEN}Listening on port(s): $ports${NC}"
            fi
        else
            echo -e "${YELLOW}PID file exists but process is not running${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}No saved server process found${NC}"
    fi
    
    # Check default port
    if check_port $DEFAULT_PORT; then
        local pid=$(get_pid_from_port $DEFAULT_PORT)
        echo -e "${YELLOW}Port $DEFAULT_PORT is in use by PID: $pid${NC}"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status} [port]"
    echo ""
    echo "Commands:"
    echo "  start [port]   Start the development server (default port: $DEFAULT_PORT)"
    echo "  stop           Stop the development server"
    echo "  restart [port] Restart the development server"
    echo "  status         Check if the server is running"
    echo ""
    echo "Examples:"
    echo "  $0 start       # Start on default port $DEFAULT_PORT"
    echo "  $0 start 3002  # Start on port 3002"
    echo "  $0 stop        # Stop the server"
    echo "  $0 restart     # Restart on default port"
    echo "  $0 status      # Check server status"
}

# Main script logic
case "$1" in
    start)
        start_server $2
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server $2
        ;;
    status)
        check_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac