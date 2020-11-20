#!/bin/sh

mode=`uci get glconfig.bridge.mode 2>/dev/null`
if [ "$mode" = "ap" -o "$mode" = "wds" -o "$mode" = "relay" ];then
	exit 1
fi
/etc/init.d/glfw restart

