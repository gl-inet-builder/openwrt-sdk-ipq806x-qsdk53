"use strict";

define(["text!temple/gps/index.html", "css!temple/gps/index.css", "jstz", "vue", "component/gl-btn/index", "component/gl-select/index", "component/gl-toggle-btn/index", "component/gl-input/index", ], function (temp, css, jstz, Vue, gl_btn, gl_select, gl_toggle, gl_input) {
    var vueComponent = Vue.extend({
        template: temp,
        data: function data() {
            return {
                deviceMac: "",
                utc_time: "",
                Nlatitude: "",
                Etlongitude: "",
                report_path: "",
                report_interval: "",
                enabled: false,
                GPS_btn_Status: false,
                GpsData_fred: "",
                timer: null,
                gpsStutas: ''


            };
        },
        components: {
            "gl-btn": gl_btn,
            "gl-select": gl_select,
            "gl-tg-btn": gl_toggle,
            "gl-input": gl_input,
        },
        mounted: function mounted() {
            var that = this;
            that.timerData()
            if (that.reportget && that.reportget.code) {
                that.enabled = that.reportget.enable
                that.report_path = that.reportget.report_path
                that.report_interval = that.reportget.report_interval
            } else {
                that.$store.dispatch("call", {
                    api: "reportget"
                }).then(function (result) {
                    that.enabled = result.enable
                    that.report_path = result.report_path
                    that.report_interval = result.report_interval
                })
            }
        },
        computed: {
            gpsget: function gpsget() {
                return this.$store.getters.apiData["gpsget"];
            },
            reportget: function reportget() {
                return this.$store.getters.apiData["reportget"];
            },
            GPSStuttgart: function GPSStuttgart() {
                var item;
                if (this.gpsStutas) {
                    item = this.t('Valid')
                } else {
                    item = this.t('Invalid')
                }
                return item
            }
        },
        methods: {
            getData: function getData() {
                var that = this
                that.$store.dispatch("call", {
                    api: "gpsget",
                }).then(function (result) {
                    that.deviceMac = result.mac
                    that.gpsStutas = result.status
                    if (result.success && result.status) {
                        that.utc_time = result.utc_date + " " + result.utc_time
                        that.Nlatitude = result.north_latitude
                        that.Etlongitude = result.east_longitude
                        that.GpsData_fred = result.data
                    } else {
                        that.utc_time = "-"
                        that.Nlatitude = "-"
                        that.Etlongitude = "-"
                        that.GpsData_fred = ""
                    }
                })
            },
            timerData: function timerData() {
                var that = this;
                that.getData();
                that.timer = setInterval(function () {
                    that.getData();
                }, 30000);
            },
            applyDataReport: function applyDataReport() {
                var Reg = /^\d+$/
                var UrlReg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
                if (!this.report_interval || !this.report_path) {
                    this.$message({
                        "type": "warning",
                        "api": "reportset",
                        "msg": -1309
                    })
                    return
                }
                if (!Reg.test(this.report_interval) || this.report_interval == 0) {
                    this.$message({
                        type: 'error',
                        msg: this.$lang.clients.Dataerror
                    });
                    return
                }
                if (!UrlReg.test(this.report_path)) {
                    this.$message({
                        type: 'error',
                        msg: this.$lang.clients.Dataerror
                    });
                    return
                }
                clearInterval(this.timer)
                var that = this
                that.$store.dispatch("call", {
                    api: 'reportset',
                    data: {
                        enable: this.enabled,
                        report_path: this.report_path,
                        report_interval: this.report_interval,
                    }
                }).then(function (result) {
                    that.timerData()
                    if (result.success) {
                        that.$message({
                            "type": "success",
                            "api": "ddnsset",
                            "msg": result.code
                        });
                    } else {
                        that.$message({
                            "type": "error",
                            "api": "ddnsset",
                            "msg": result.code
                        });
                    }
                })
            },
            enabledData: function enabledData(data) {
                this.enabled = data
                this.GPS_btn_Status = true
            }
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
                        $("#vpn").collapse("hide");
                        $("#moresetting").collapse("show");
                        $("#applications").collapse("hide");
                        $("#system").collapse("hide");
                    }
                }, 50);
            });
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            clearInterval(this.timer);
            next()
        }
    });
    return vueComponent;
});