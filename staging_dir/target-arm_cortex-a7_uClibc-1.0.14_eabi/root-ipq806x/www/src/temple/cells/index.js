"use strict";

define(["text!temple/cells/index.html", "css!temple/cells/index.css", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index", "clipboard"], function (stpl, css, Vue, gl_btn, gl_input, gl_select, clipboardJS) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                modem_id: this.$route.query.id,
                bus: this.$route.query.bus,
                cells: [],
                btnStatus: false,
                copyNumber: '18404960408',
                iscopyJson: null,
                isretate: true,
                cellIndex: null,
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select
        },
        mounted() {

            var that = this;
            that.$store.dispatch('call', {
                api: "simcells",
                data: {
                    modem_id: this.$route.query.id,
                    bus: this.$route.query.bus
                }
            }).then(function (result) {
                if (result.success) {
                    that.cells = result.cells;
                }
            });
            this.iscopyJson = new clipboardJS('.copyJson')
        },
        methods: {
            retateShow: function retateShow(index){
                this.isretate = !this.isretate
                this.cellIndex = index
                $(".collapse").collapse("hide");
            },
            initClipboard: function initClipboard() {
                var that = this;
                var copy = this.iscopyJson
                copy.on('success', function () {
                    that.$message({
                        type: "success",
                        msg: that.t("Successful copy")
                    })
                })

                copy.on('error', function () {
                    that.$message({
                        type: "error",
                        msg: "Copy Error"
                    })
                });
            },
            getCells: function getCells() {
                var that = this;
                this.btnStatus = true;
                that.$store.dispatch('call', {
                    api: "simcells",
                    data: {
                        modem_id: this.$route.query.id,
                        bus: this.$route.query.bus
                    }
                }).then(function (result) {
                    that.btnStatus = false;
                    if (result.success) {
                        that.cells = result.cells;
                        that.$message({
                            type: "success",
                            api: "simcells",
                            msg: result.code
                        })
                    } else {
                        that.$message({
                            type: "error",
                            api: "simcells",
                            msg: result.code
                        })
                    }
                })
            },

        },

        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
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
    });
    return vueComponent;
});