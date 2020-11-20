"use strict";

define(["text!temple/sms/index.html", "vue", "component/gl-btn/index", "component/gl-input/index", "component/gl-select/index", "clipboard", "component/modal/modal", "css!temple/sms/index.css", "component/gl-tooltip/index"], function (stpl, Vue, gl_btn, gl_input, gl_select, clipboardJS, modal, css, gl_tooltip) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                tel: '',
                email: '',
                loadingStatus: false,
                applyStatus: true,
                applyAccountStatus: true,
                accountLoadingStatus: false,
                accountApplyStatus: true,
                account: '',
                password: '',
                domain: '',
                smtp: '',
                showModal: false,
                protocalArr: ['SSL/TLS(465)', 'TLS/STARTTLS(587)'],
                protocolVal: 'SSL/TLS(465)',
                localTel: ''
            }
        },
        components: {
            "gl-btn": gl_btn,
            "gl-input": gl_input,
            "gl-select": gl_select,
            "gl-modal": modal,
            "gl-tooltip": gl_tooltip
        },
        mounted: function mounted() {
            this.getSmsFlist()
        },
        methods: {
            setApplyStatus: function setApplyStatus() {
                this.applyStatus = false;
            },
            setApplyAccountStatus: function setApplyAccountStatus() {
                this.applyAccountStatus = false;
            },
            setSmsForward: function setSmsForward() {
                var _this = this;
                _this.applyStatus = true;
                _this.loadingStatus = true;
                var telStr = ''
                var emailStr = ''
                _this.tel = _this.tel.replace(/\s*/g,'')
                _this.email = _this.email.replace(/\s*/g,'')
                telStr = _this.tel.replace(/\|/g,' ')
                emailStr = _this.email.replace(/\|/g,',')
                _this.$store.dispatch('call', {
                    api: 'setSms',
                    data: {
                        modem_id: _this.$route.query.id,
                        bus: _this.$route.query.bus,
                        tel: telStr,
                        email: emailStr
                    }
                }).then(function (result) {
                    _this.applyStatus = false;
                    _this.loadingStatus = false;
                    if (result.success) {
                        _this.tel = '';
                        _this.email = '';
                        _this.$message({
                            type: "success",
                            api: "setSms",
                            msg: result.code
                        });
                        _this.getSmsFlist()
                    } else {
                        _this.$message({
                            type: "error",
                            api: "setSms",
                            msg: result.code
                        });
                    }
                });
            },
            getSmsFlist: function getSmsFlist() {
                var _this = this
                _this.$store.dispatch('call', {
                    api: 'getSms'
                }).then(function(res) {
                    if(res.code == 0) {
                        _this.tel = res.tel_list;
                        _this.email = res.email_list;
                        _this.domain = res.domain;
                        _this.smtp = res.smtp;
                        _this.account = res.account;
                        _this.password = res.password;
                        if (res.protocol == 'tls') {
                            _this.protocolVal = 'SSL/TLS(465)'
                        } else if (res.protocol == 'starttls') {
                            _this.protocolVal = 'TLS/STARTTLS(587)'
                        };
                        _this.localTel = res.local_tel 
                    }
                })
            },
            setAccountInfo: function setAccountInfo() {
                var _this = this;
                // if (this.account.length == 0 || this.password == 0 || this.domain == 0 || this.smtp == 0) {
                if (this.account.length == 0 || this.password.length == 0 || this.smtp.length == 0 || this.localTel.length == 0) {
                    _this.$message({
                        type: "error",
                        msg: 'Please fill in the information completely'
                    });
                    return
                } else {
                    var protocol = '';
                    if(_this.protocolVal == 'SSL/TLS(465)') {
                        protocol = 'tls'
                    } else if(_this.protocolVal == 'TLS/STARTTLS(587)') {
                        protocol = 'starttls'
                    }
                    _this.applyAccountStatus = true;
                    _this.accountLoadingStatus = true;
                    _this.showModal = true
                    _this.$store.dispatch('call', {
                        api: 'sendaccount',
                        data: {
                            account: _this.account,
                            password: _this.password,
                            domain: _this.domain,
                            smtp: _this.smtp,
                            protocol: protocol,
                            local_tel: _this.localTel
                        }
                    }).then(function (result) {
                        if (result.success) {
                            _this.applyAccountStatus = false;
                            _this.accountLoadingStatus = false;
                            _this.$message({
                                type: "success",
                                api: "sendaccount",
                                msg: result.code
                            });
                            _this.getSmsFlist()
                        } else {
                            _this.applyAccountStatus = false;
                            _this.accountLoadingStatus = false;
                            _this.$message({
                                type: "error",
                                api: "sendaccount",
                                msg: result.code
                            });
                        }
                    });
                }
            }
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