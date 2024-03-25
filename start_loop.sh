#!/bin/bash

export answer="y"

while true; do
    npm run bot
    read -r -t 12 -p "Restart now (y) or exit to shell (n)?  " answer
    if [[ "$answer" =~ ^([nN][oO]|[nN])+$ ]]; then
        echo "INFO: User cancelled restart; exiting to shell"
        echo ""
        exit 0
    fi
    echo ""
    echo "Rebooting the bot!"
done