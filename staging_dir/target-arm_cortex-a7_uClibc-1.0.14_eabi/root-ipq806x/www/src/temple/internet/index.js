"use strict";

define(["vue", "text!temple/internet/index.html", "css!temple/internet/index.css", "temple/internet/modem", "temple/internet/repeater", "temple/internet/tethering", "temple/internet/waninfo"], function (Vue, stpl, css, modem, repeater, tethering, waninfo) {
    var vueComponent = Vue.extend({
        template: stpl,
        components: {
            "modem": modem,
            "repeater": repeater,
            "tethering": tethering,
            "waninfo": waninfo
        },
        data: function data() {
            return {
                stateClass: 'col-lg-4',
                timer_clients: null,
                timer_router: null,
                timer_getmcu: null
            };
        },
        computed: {
            onlist: function onlist() {
                if (this.$store.getters.onlist.length) {
                    return this.$store.getters.onlist;
                } else {
                    if (this.router.model == 'ap1300') {
                        this.$store.commit('setonlist', {
                            data: 'waninfo'
                        });
                    }
                    return ['waninfo'];
                }
            },
            offlist: function offlist() {
                var len = this.$store.getters.offlist.length;
                switch (len) {
                    case 0:
                        this.stateClass = 'hide';
                        break;
                    case 1:
                        this.stateClass = 'col-lg-12 uninternet';
                        break;
                    case 2:
                        this.stateClass = 'col-lg-6';
                        break;
                    case 3:
                        this.stateClass = 'col-lg-4';
                        break;
                }
                if (len == 4) {
                    return ["repeater", "modem", "tethering"];
                } else {
                    if (this.router.model == 'n300'|| this.router.model == 'b2200') {
                        if (this.onlist.indexOf('repeater') == -1) {
                            this.stateClass = 'col-lg-12 uninternet';
                            return ['repeater'];
                        }
                    }
                    return this.$store.getters.offlist;
                }
            },
            loading: function loading() {
                return this.$store.getters.isLoading;
            },
            router: function router() {
                return this.$store.getters.apiData['router'];
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
            this.$store.commit("isGetStatus_inter", false); // 无网络是否显示提示
            if (!this.meshjudge) {
                this.$store.dispatch("getInfo_repeater"); // 全局一直调用定时器 repeater vpnlist reachable
            }
            this.$store.dispatch('call', {
                api: 'getaps'
            }); // 获取路由器wifi是什么
            that.timer_router = setInterval(function () {
                that.$store.dispatch('call', {
                    api: 'router'
                });
            }, 5000);
            if (that.router.model == 'mifi' || that.router.model == 'e750') {
                that.$store.dispatch('call', {
                    api: 'getmcu'
                });
                that.timer_getmcu = setInterval(function () {
                    that.$store.dispatch('call', {
                        api: 'getmcu'
                    });
                }, 26000);
            }
            // if (that.router.mode == 'router') {
            //     this.$store.dispatch('call', { api: 'router_clients' }); //当前连接client 数量
            //     that.timer_clients = setInterval(function () {
            //         that.$store.dispatch('call', { api: 'router_clients' }); //当前连接client 数量
            //     }, 5000);
            // }
            if (this.loading) {
                that.$store.dispatch('call', {
                    api: 'router'
                });
            }
        },
        methods: {},
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideDown();
                if ($(".clsLink2internet").hasClass("bar")) {
                    $(".bar.active").removeClass("active");
                    $(".clsLink2internet").addClass("active");
                    $("#applications").collapse("hide");
                    $("#moresetting").collapse("hide");
                    $("#system").collapse("hide");
                    $("#vpn").collapse("hide");
                };
            });
        },

        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            this.$store.commit("isGetStatus_inter", true);
            this.$store.commit('clearTimer_sta');
            clearInterval(this.timer_clients);
            clearInterval(this.timer_getmcu);
            clearInterval(this.timer_router);
            next();
        }
    });
    return vueComponent;
});
