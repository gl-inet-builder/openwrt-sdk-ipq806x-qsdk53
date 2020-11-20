#!/bin/sh

# trap "" INT HUP
trap "" HUP
while true; do
[ -n "$(lsmod | grep gl_hw_wdt)" ] && break
sleep 5
done
echo 0 > /sys/class/gpio/export
echo high > /sys/class/gpio/gpio0/direction
