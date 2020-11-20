#!/bin/sh

gl_modem_info()
{
	strength=`gl_modem -B $1 signal | jsonfilter -e @.strength`
	if [ "$1" = "1-1.2" ];then	
		if [ "$strength" = 4 ];then
			gl_uart 474c190107 1>/dev/null 2>&1 
		elif [ "$strength" = 3 -o "$strength" = 2 ];then
			gl_uart 474c190103 1>/dev/null 2>&1
		elif [ "$strength" = 1 ];then
			gl_uart 474c190101 1>/dev/null 2>&1
		elif [ "$strength" = 0 ];then
			gl_uart 474c190100 1>/dev/null 2>&1
		fi
	elif [ "$1" = "2-1.2" -a "$hwversion" != "53" ];then	
		if [ "$strength" = 4 ];then
			gl_uart 474c1a0138 1>/dev/null 2>&1
		elif [ "$strength" = 3 -o "$strength" = 2 ];then
			gl_uart 474c1a0118 1>/dev/null 2>&1
		elif [ "$strength" = 1 ];then
			gl_uart 474c1a0108 1>/dev/null 2>&1
		elif [ "$strength" = 0 ];then
			gl_uart 474c1a0100 1>/dev/null 2>&1
		fi
	elif [ "$1" = "2-1.2" -a "$hwversion" = "53" ];then	
		simnum=`cat /sys/kernel/debug/gpio | grep sim | awk '{print $6}'`
		if [ "$simnum" = "hi" ];then # SIM 2
			if [ "$strength" = 4 ];then
				gl_uart 474c1a0138 1>/dev/null 2>&1
			elif [ "$strength" = 3 -o "$strength" = 2 ];then
				gl_uart 474c1a0118 1>/dev/null 2>&1
			elif [ "$strength" = 1 ];then
				gl_uart 474c1a0108 1>/dev/null 2>&1
			elif [ "$strength" = 0 ];then
				gl_uart 474c1a0100 1>/dev/null 2>&1
			fi
		else #SIM 1
			if [ "$strength" = 4 ];then
				gl_uart 474c190107 1>/dev/null 2>&1 
			elif [ "$strength" = 3 -o "$strength" = 2 ];then
				gl_uart 474c190103 1>/dev/null 2>&1
			elif [ "$strength" = 1 ];then
				gl_uart 474c190101 1>/dev/null 2>&1
			elif [ "$strength" = 0 ];then
				gl_uart 474c190100 1>/dev/null 2>&1
			fi

		fi

	fi
}
hwversion=`hexdump -v -n 1 -s $((0x9c)) -e '1/1 "%x"' /dev/mtd2`
if [ "$hwversion" = "53" ];then
	simnum=`cat /sys/kernel/debug/gpio | grep sim | awk '{print $6}'`
	if [ "$simnum" = "hi" ];then  #SIM 2
		gl_uart 474c190100
	else
		gl_uart 474c1a0100
	fi
fi
simflag=`gl_modem -B $1 sim-status`
if [ "$simflag" = "NO_SIM" ];then
	if [ "$1" = "1-1.2" ];then
		gl_uart 474c190100
		exit
	elif [ "$1" = "2-1.2" ];then
		gl_uart 474c1a0100
		exit
	fi
fi
if [ ! -f "/tmp/modem.$1/signal" ];then
	gl_modem_info
	exit 0 
fi

modeminfo=`cat /tmp/modem.$1/signal`
type=`echo $modeminfo | jsonfilter -e @.type`
if [ "$type" = "" ];then
	gl_modem_info
fi
#echo type=$type bus=$1
strength=0
if [ "$type" = "lte" ];then
	rssi=`echo $modeminfo | jsonfilter -e @.rssi`
	rsrp=`echo $modeminfo | jsonfilter -e @.rsrp`
	rsrq=`echo $modeminfo | jsonfilter -e @.rsrq`
	snr=`echo $modeminfo | jsonfilter -e @.snr`
	#echo rssi=$rssi rsrp=$rsrp rsrq=$rsrq snr=$snr
	if [ "$rsrp" -ge -90 ];then
		strength=4
	elif [ "$rsrp" -ge -105 ];then
		strength=3
	elif [ "$rsrp" -ge -120 ];then
		strength=2
	elif [ "$rsrp" -lt -120 ];then
		strength=1
	fi
	if [ "$rsrq" -ge -9 ];then
		strength=`expr $strength + 4`
	elif [ "$rsrq" -ge -12 ];then
		strength=`expr $strength + 3`
	elif [ "$rsrq" -ge -13 ];then
		strength=`expr $strength + 2`
	elif [ "$rsrq" -lt -13 ];then
		strength=`expr $strength + 1`
	fi
	if [ "$snr" -ge 200 ];then
		strength=`expr $strength + 4`
	elif [ "$snr" -ge 120 ];then
		strength=`expr $strength + 3`
	elif [ "$snr" -ge 0 ];then
		strength=`expr $strength + 2`
	elif [ "$snr" -lt 0 ];then
		strength=`expr $strength + 1`
	fi
	if [ "$rssi" -ge -65 ];then
		strength=`expr $strength + 4`
	elif [ "$rssi" -ge -75 ];then
		strength=`expr $strength + 3`
	elif [ "$rssi" -ge -85 ];then
		strength=`expr $strength + 2`
	elif [ "$rssi" -lt -85 ];then
		strength=`expr $strength + 1`
	fi
	#ret=4 4G
	strength=`expr $strength / 4`
	#echo strength=$strength ret=$ret
elif [ "$type" = "wcdma" ];then
	rssi=`echo $modeminfo | jsonfilter -e @.rssi`
	ecio=`echo $modeminfo | jsonfilter -e @.ecio`
	if [ "$rssi" -ge -70 ];then
		strength=3;
	elif [ "$rssi" -ge -80 ];then
		strength=2;
	elif [ "$rssi" -ge -95 ];then
		strength=1;
	elif [ "$rssi" -lt -95 ];then
		strength=0;
	fi
	if [ "$ecio" -ge 0 ];then
		strength=`expr $strength + 4`
	elif [ "$ecio" -ge -10 ];then
		strength=`expr $strength + 3`
	elif [ "$ecio" -ge -20 ];then
		strength=`expr $strength + 2`
	elif [ "$ecio" -lt -20 ];then
		strength=`expr $strength + 1`
	fi
	strength=`expr $strength / 2`
	#ret = 3; 3G
elif [ "$hdr" = "hdr" ];then
	rssi=`echo $modeminfo | jsonfilter -e @.rssi`
	ecio=`echo $modeminfo | jsonfilter -e @.ecio`
	if [ "$rssi" -ge -70 ];then
		strength=4
	elif [ "$rssi" -ge -80 ];then
		strength=3
	elif [ "$rssi" -ge -95 ];then
		strength=2
	elif [ "$rssi" -lt -95 ];then
		strength=1
	fi	
	if [ "$ecio" -ge 0 ];then
		strength=`expr $strength + 4`
	elif [ "$ecio" -ge -10 ];then
		strength=`expr $strength + 3`
	elif [ "$ecio" -ge -20 ];then
		strength=`expr $strength + 2`
	elif [ "$ecio" -lt -20 ];then
		strength=`expr $strength + 1`
	fi
	strength=`expr $strength / 2`
	#ret=3 4G
elif [ "$type" = "cdma" ];then
	rssi=`echo $modeminfo | jsonfilter -e @.rssi`
	ecio=`echo $modeminfo | jsonfilter -e @.ecio`
	if [ "$rssi" -ge -70 ];then	
		strength=4;
	elif [ "$rssi" -ge -80 ];then	
		strength=3;
	elif [ "$rssi" -ge -95 ];then	
		strength=2;
	elif [ "$rssi" -lt -95 ];then	
		strength=1;
	fi
	if [ "$ecio" -ge 0 ];then
		strength=`expr $strength + 4`
	elif [ "$ecio" -ge -10 ];then
		strength=`expr $strength + 3`
	elif [ "$ecio" -ge -20 ];then
		strength=`expr $strength + 2`
	elif [ "$ecio" -lt -20 ];then
		strength=`expr $strength + 1`
	fi
	strength=`expr $strength / 2`
	#ret=2
elif [ "$type" = "gsm" ];then
	signal=`echo $modeminfo | jsonfilter -e @.signal`
	if [ "$signal" -ge -70 ];then	
		strength=4
	elif [ "$signal" -ge -80 ];then	
		strength=3
	elif [ "$signal" -ge -95 ];then	
		strength=2
	elif [ "$signal" -lt -95 ];then	
		strength=1
	fi
	#ret=2
elif [ "$type" = "tdma" ];then
	signal=`echo $modeminfo | jsonfilter -e @.signal`
	if [ "$signal" -ge -70 ];then
		strength=4
	elif [ "$signal" -ge -80 ];then
		strength=3
	elif [ "$signal" -ge -95 ];then
		strength=2
	elif [ "$signal" -lt -95 ];then
		strength=1
	fi	
else
	strength=0
fi
if [ "$1" = "1-1.2" ];then	
	if [ "$strength" = 4 ];then
		gl_uart 9600 474c190107 1>/dev/null 2>&1 
	elif [ "$strength" = 3 -o "$strength" = 2 ];then
		gl_uart 9600 474c190103 1>/dev/null 2>&1
	elif [ "$strength" = 1 ];then
		gl_uart 9600 474c190101 1>/dev/null 2>&1
	elif [ "$strength" = 0 ];then
		gl_uart 9600 474c190100 1>/dev/null 2>&1
	fi
elif [ "$1" = "2-1.2" -a "$hwversion" != "53" ];then	
	if [ "$strength" = 4 ];then
		gl_uart 9600 474c1a0138 1>/dev/null 2>&1
	elif [ "$strength" = 3 -o "$strength" = 2 ];then
		gl_uart 9600 474c1a0118 1>/dev/null 2>&1
	elif [ "$strength" = 1 ];then
		gl_uart 9600 474c1a0108 1>/dev/null 2>&1
	elif [ "$strength" = 0 ];then
		gl_uart 9600 474c1a0100 1>/dev/null 2>&1
	fi
elif [ "$1" = "2-1.2" -a "$hwversion" = "53" ];then	
	simnum=`cat /sys/kernel/debug/gpio | grep sim | awk '{print $6}'`
	if [ "$simnum" = "hi" ];then  #SIM 2
		if [ "$strength" = 4 ];then
			gl_uart 9600 474c1a0138 1>/dev/null 2>&1
		elif [ "$strength" = 3 -o "$strength" = 2 ];then
			gl_uart 9600 474c1a0118 1>/dev/null 2>&1
		elif [ "$strength" = 1 ];then
			gl_uart 9600 474c1a0108 1>/dev/null 2>&1
		elif [ "$strength" = 0 ];then
			gl_uart 9600 474c1a0100 1>/dev/null 2>&1
		fi
	else # SIM 1
		if [ "$strength" = 4 ];then
			gl_uart 9600 474c190107 1>/dev/null 2>&1 
		elif [ "$strength" = 3 -o "$strength" = 2 ];then
			gl_uart 9600 474c190103 1>/dev/null 2>&1
		elif [ "$strength" = 1 ];then
			gl_uart 9600 474c190101 1>/dev/null 2>&1
		elif [ "$strength" = 0 ];then
			gl_uart 9600 474c190100 1>/dev/null 2>&1
		fi
	fi
fi

