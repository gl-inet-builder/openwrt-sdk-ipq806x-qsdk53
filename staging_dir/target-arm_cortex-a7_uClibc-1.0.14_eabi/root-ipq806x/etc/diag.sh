#!/bin/sh
# Copyright (C) 2006-2019 OpenWrt.org

. /lib/functions/leds.sh

boot=power_led
failsafe=power_led
running=power_led
upgrade=power_led
internet=lte_led

set_led_state() {
	[ -z "$(grep AP-DK01.1-C2 /proc/device-tree/model)" ] && return
	status_led="$boot"

	case "$1" in
	preinit)
		status_led_booting
		;;
	failsafe)
		status_led_off
		[ -n "$running" ] && {
			status_led="$running"
			status_led_off
		}
		status_led="$failsafe"
		status_led_blink_failsafe
		;;
	preinit_regular)
		status_led_booting
		;;
	upgrade)
		[ -n "$running" ] && {
			status_led="$running"
			status_led_off
		}
		status_led="$upgrade"
		status_led_booting
		;;
	done)
		status_led_off
		[ -n "$running" ] && {
			status_led="$running"
			status_led_on
		}
		;;
	no_internet)
		status_led="$internet"
		status_led_off
		uci set system.lte_led.trigger=none
		uci set system.lte_led.default=0
		uci commit system
		;;
	has_internet)
		status_led="$internet"
		status_led_on
		uci set system.lte_led.trigger=none
		uci set system.lte_led.default=1
		uci commit system
		;;
	esac
}

set_state() {
	[ -n "$boot" -o -n "$failsafe" -o -n "$running" -o -n "$upgrade" ] && set_led_state "$1"
}
