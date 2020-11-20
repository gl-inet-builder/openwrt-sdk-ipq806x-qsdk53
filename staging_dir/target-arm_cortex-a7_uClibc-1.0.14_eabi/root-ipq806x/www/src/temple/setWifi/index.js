"use strict";

define(["text!temple/setWifi/index.html", "css!temple/setWifi/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-tooltip/index", "component/gl-select/index", "component/gl-label/index", "component/gl-toggle-btn/index"], function (stpl, css, Vue, gl_btn, gl_input, gl_tooltip, gl_select, gl_label, gl_switch) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                timer: "",
                sortWifiData: [],
                scanDone: false,
                // alertStatus: 'info',
                // alertInfo: this.$lang.setWifi.scanning,
                iProgress: -9,
                passwordArray: [],
                checked: false,
                // isConnecting: false,
                connectingIndex: null,
                btnMove: false,
                // iconStatus: "",
                wifilist: false,
                mode: ["WISP", "WDS"],
                checkstate: true,
                curSelect: "",
                modeState: "",
                psw: "",
                wifiName: "",
                lanip: "",
                wifiIndex: "",
                usname: "",
                knowshow: false,
                isRember: true,
                resultWiFiList: [],
                resultwifiDfslist: [],
                working: [],
                SecurityList: ['OPEN', 'WPA2-PSK', 'WPA/WPA2-PSK', "802.1X EAP/WPA", "802.1X EAP/WPA2"],
                CompatibleList: ['OPEN', 'WPA2-PSK', 'WPA/WPA2-PSK', ],
                typeClass: ["2.4G", "5G"],
                securityVal: "OPEN",
                otherSsid: "",
                otherDevice: "2.4G",
                channelList : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
                channelVal: "",
            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-tooltip": gl_tooltip,
            "gl-select": gl_select,
            "gl-label": gl_label,
            "gl-switch": gl_switch
        },
        computed: {
            joinstate: function joinstate() {
                var status = false;
                switch (this.modeState) {
                    case "WDS":
                        if (!this.lanip || !this.psw) {
                            status = true;
                        }
                        break;
                    case "EAP":
                        if (!this.usname || !this.psw) {
                            status = true;
                        }
                        break;
                    default:
                        if (this.curSelect.encrypt != 'none') {
                            if (!this.psw) {
                                status = true;
                            }
                        } else {
                            status = false;
                        }
                }
                return status;
            },
            stainfo: function stainfo() {
                return this.$store.getters.apiData["stainfo"];
            },
            scanwifi: function scanwifi() {
                return this.$store.getters.apiData["scanwifi"];
            },
            router: function router() {
                return this.$store.getters.apiData["router"];
            },
            timeout: function timeout() {
                var item = 30000;
                if (this.router.model == 's1300' || this.router.model == 'b1300') {
                    item = 60000;
                }
                return item;
            },
            progressWidthObj: function progressWidthObj() {
                return {
                    width: this.iProgress + "%"
                };
            },
            ChannelStatus: function ChannelStatus() {
                return this.router.model != 'vixmini' && this.router.model != 'n300' && this.router.model != 'mt300n-v2'
            },
            Compatible: function Compatible(){
                if (this.ChannelStatus) {
                    return this.SecurityList;
                }
                return this.CompatibleList;
            },
            singleRouter: function singleRouter() {
                if (this.router.dualfreq) {
                    return true
                }
                return false
            },
            meshjudge: function meshjudge() {
                if (this.router.mode == 'mesh') {
                    return true
                }
                return false
            }
        },
        mounted: function mounted() {
            var that = this;
            this.getWifiData();
            // this.$store.dispatch("getInfo_repeater"); // 全局一直调用定时器 repeater vpnlist reachable
            that.$store.dispatch("call", {
                api: 'stainfo'
            })
        },
        methods: {
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            changeIProgress: function changeIProgress() {
                if (this.scanDone || this.iProgress > 90) {} else {
                    setTimeout(this.changeIProgress, 500);
                    this.iProgress = this.iProgress + parseInt(9);
                }
            },
            reScan: function reScan() {
                this.securityVal = "OPEN";
                this.scanDone = false;
                this.iProgress = -9;
                this.otherSsid = "";
                this.sortWifiData = [];
                this.resultWiFiList = [];
                this.resultwifiDfslist = [];
                this.working = [];
                this.wifilist = false; // 显示wifi列表
                this.getWifiData();
                this.$store.dispatch("call", {
                    api: 'stainfo'
                })
            },
            compare: function compare(name, num) {
                return function (o, p) {
                    var a = a && a.toLowerCase();
                    var b = b && b.toLowerCase();
                    if (o && p && typeof o === 'object' && typeof p === 'object') {
                        a = o[name];
                        b = p[name];
                        if (a === b) {
                            return typeof num === 'function' ? num(o, p) : 0;
                        }
                        if (typeof a === typeof b) {
                            return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
                        }
                        return typeof a < typeof b ? -1 : 1;
                    } else {
                        thro("error");
                    }
                }
            },
            getWifiData: function getWifiData() {
                var that = this;
                that.btnMove = true;
                this.changeIProgress();
                this.$store.dispatch("call", {
                    api: "scanwifi",
                    timeOut: this.timeout
                }).then(function (result) {
                    that.scanDone = true;
                    that.btnMove = false;
                    if (result.success) {
                        that.wifiName = "";
                        that.psw = "";
                        that.usname = "";
                        that.lanip = "";
                        that.wifilist = true;
                        that.btnMove = false;
                        if (result.wifis.length > 0) {
                            that.$store.dispatch("getWifi").then(function (data) {
                                var list5g = []
                                var list2g = []
                                var obj = {}
                                var objs = {}
                                for (var _i = 0; _i < data.wifis.length; _i++) {
                                    if (data.wifis[_i].type != "normal") {
                                        that.resultWiFiList.push(data.wifis[_i]);
                                    } else {
                                        that.resultwifiDfslist.push(data.wifis[_i]);
                                    }
                                }
                                that.resultwifiDfslist.sort(that.compare('ssid'));
                                that.sortWifiData = that.resultwifiDfslist.concat(that.resultWiFiList);
                                for (var i = 0; i < that.sortWifiData.length; i++) {
                                    if (that.sortWifiData[i].ssid == that.stainfo.ssid && that.sortWifiData[i].encrypt == that.stainfo.encryp) {
                                        that.working = that.sortWifiData[i];
                                        that.sortWifiData.splice(i, 1);
                                        that.sortWifiData.unshift(that.working);
                                        break;
                                    }
                                }
                                var obj = {
                                    "ssid": "Other...",
                                    "type": 'normal',
                                    "encrypt": "none",
                                    "signal": 0,
                                }
                                that.sortWifiData.push(obj)
                            });
                        }
                    } else {
                        that.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            KeyMinLengthMsg: function KeyMinLengthMsg(encrypt) {
                var result = null;
                if (encrypt == "wep") {
                    result = this.$lang.setWifi.characters;
                } else if (encrypt != "none") {
                    result = this.$lang.setWifi.least_8;
                }
                return result;
            },
            VerifyWifiKeyLen: function VerifyWifiKeyLen(sEncryption, sKey) {
                if (sEncryption == "none") {
                    return true;
                } else if (sEncryption == "wep" && (sKey.length == 5 || sKey.length == 13)) {
                    return true;
                } else if (sKey.length < 8) {
                    return false;
                }
                return true;
            },

            hide: function hide() {
                $(".wifilistCollapse").collapse("hide");
                this.checked = false;
            },
            clickItem: function clickItem(index) {
                this.checked = false;
                if (this.sortWifiData[index].encrypt == "none" || this.sortWifiData[index].issaved) {
                    if (this.sortWifiData[index].mac == this.stainfo.mac) {
                        this.$router.push("internet");
                    }
                }
            },
            cmp_setwifi_ConvertWifiSignal: function cmp_setwifi_ConvertWifiSignal(iSignal) {
                if (iSignal > -50) {
                    return "full";
                } else if (iSignal > -75 && iSignal <= -50) {
                    return "strong";
                } else if (iSignal > -90 && iSignal <= -75) {
                    return "medium";
                }
                return "weak";
            },
            changeWifi: function changeWifi(data) {
                // 两种模式 psk-mixed 
                var encrypt = data.encrypt;
                if (encrypt.toLowerCase().indexOf("wpa") != -1) {
                    this.modeState = "EAP";
                } else {
                    // wap-mode
                    this.modeState = "WISP";
                }
                this.curSelect = data;
            },
            join: function join() {
                // if (this.curSelect.mac == this.stainfo.mac && this.stainfo.enabled && this.stainfo.ip) {
                //     this.$message({
                //         type: 'warning',
                //         msg: '-1802'
                //     });
                //     return;
                // }
                if (this.wifiName == "Other...") {
                    if (!this.otherSsid) {
                        this.$message({
                            type: 'warning',
                            msg: this.$lang.ssserver.dontEmpty
                        });
                        return
                    }
                    if (this.securityVal == "WPA2-PSK" || this.securityVal == "WPA/WPA2-PSK") {
                        if (!this.psw) {
                            this.$message({
                                type: 'warning',
                                msg: this.$lang.ssserver.dontEmpty
                            });
                            return
                        }
                        if (this.psw.length > 63 || this.psw.length < 8) {
                            this.$message({
                                type: 'warning',
                                msg: -1801
                            });
                            return;
                        }
                    }
                    if (this.securityVal == "802.1X EAP/WPA" || this.securityVal == "802.1X EAP/WPA2") {

                        if (!this.usname || !this.psw) {
                            this.$message({
                                type: 'warning',
                                msg: this.$lang.ssserver.dontEmpty
                            });
                            return
                        }
                        if (this.psw.length > 64 || this.usname.length > 64) {
                            this.$message({
                                type: 'warning',
                                msg: 'User name or password length is incorrect'
                            });
                            return;
                        }
                    }
                }
                var index = this.wifiIndex;
                var that = this;
                var data;
                var password = this.psw || "";
                var otherType = "5G";
                var othersecurity = "none"
                this.connectingIndex = index;
                if (this.curSelect.encrypt !== 'none' && this.modeState != "EAP") {
                    if (that.psw.length > 63 || this.psw.length < 8) {
                        this.$message({
                            type: 'warning',
                            msg: -1801
                        });
                        return;
                    }
                }
                if (this.otherDevice == "2.4G") {
                    otherType = '2G'
                }
                if (this.securityVal == "WPA2-PSK") {
                    othersecurity = 'psk2'
                } else if (this.securityVal == "WPA/WPA2-PSK") {
                    othersecurity = "psk-mixed"
                } else if (this.securityVal == "802.1X EAP/WPA") {
                    othersecurity = "wpa"
                } else if (this.securityVal == "802.1X EAP/WPA2") {
                    othersecurity = "wpa2"
                }
                data = {
                    ssid: this.curSelect.ssid,
                    mac: this.curSelect.mac,
                    channel: this.curSelect.channel,
                    key: password,
                    device: this.curSelect.device,
                    encrypt: this.curSelect.encrypt,
                    issaved: this.curSelect.issaved,
                    // 是否保存到已知wifi
                    save2uci: this.isRember,
                    identity: this.usname,
                    // lanip不需要传，为防止错误暂不删除
                    ipaddr: this.lanip,
                    // wds: this.modeState == "WDS"
                    mode: "",
                    caps: this.curSelect.caps
                }
                
                if (this.modeState == "EAP") {
                    if (that.psw.length > 64 || this.usname.length > 64) {
                        this.$message({
                            type: 'warning',
                            msg: 'User name or password length is incorrect'
                        });
                        return;
                    }
                    data.key = ""
                    data.password = password
                }
                if (this.wifiName == 'Other...') {
                    data = {
                        ssid: that.otherSsid,
                        key: this.securityVal == "OPEN" ? "" : password,
                        band: otherType,
                        encrypt: othersecurity,
                        save2uci: this.isRember,
                        identity: this.usname,
                    }
                    if (this.securityVal == "802.1X EAP/WPA2" || this.securityVal == "802.1X EAP/WPA") {
                        data.key = '',
                            data.password = password
                    }
                    if (!this.ChannelStatus) {
                        data.channel = this.channelVal;
                    }
                }
                that.btnMove = true;
                this.hide();
                // 参数由用户传入的由 ssid key save2uci identity ipaddr
                this.$store.dispatch("call", {
                    api: "joinwifi",
                    data: data,
                    timeOut: 120000
                }).then(function (result) {
                    if (result.failed) {
                        that.$message({
                            "type": "error",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        that.btnMove = false;
                        return;
                    }
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        that.timer = setTimeout(function () {
                            that.btnMove = false;
                            that.$router.push("internet");
                        }, 2000);
                    } else {
                        that.btnMove = false;
                        that.$message({
                            "type": "error",
                            "api": "joinwifi",
                            "msg": result.code
                        });
                        if (result.code == -100) {
                            that.$set(that.curSelect, "hasError", true);
                        }
                    }
                });
            }
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                $("a.clsLink2internet").addClass("active");
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#moreapps").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#tool").collapse("hide");
                    }
                }, 50);
            });
        },

        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            if (!this.btnMove) {
                this.$store.commit('clearTimer_sta');
                next();
            } else {
                this.$message({
                    "type": "warning",
                    "msg": -1800,
                    "duration": 2000
                });
            }
        }
    });
    return vueComponent;
});
