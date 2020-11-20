"use strict";

define(["vue", "text!temple/bluetooth/index.html", "css!temple/bluetooth/index.css", 'component/gl-btn/index', 'component/gl-loading/index', 'component/gl-input/index'], function (Vue, stpl, css, gl_btn, gl_loading, gl_input) {
    var vueComponent = Vue.extend({
        template: stpl,
        data: function data() {
            return {
                knowlist: [],
                disconnnect_status: false,
                // unconnectIndex: -1,
                connetc_status: false,
                handleIsConnectStatus: false,
                connectIndex: -1,
                connection: 0,
                deviceData: {
                    name: '',
                    connection: 0,
                    mac: '',
                    page: 'two',
                    manufacturer: '',
                    characteristic: '',
                    address_type: ''
                },
                serverlist: [],
                rebootStatus: false
            };
        },
        created: function created() {
            this.getknowlist();
        },
        beforeRouteLeave: function beforeRouteLeave(to, from, next) {
            next();
        },
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
            next(function (vm) {
                $("#router-visual").slideUp();
                setTimeout(function () {
                    if ($(".clsLink2bluetooth").hasClass("bar")) {
                        $(".bar.active").removeClass("active");
                        $(".clsLink2bluetooth").addClass("active");
                        $("#applications").collapse("hide");
                        $("#moresetting").collapse("hide");
                        $("#system").collapse("show");
                        $("#vpn").collapse("hide");
                    };
                }, 50);
            });
        },
        methods: {
            getknowlist: function getknowlist() {
                var _this = this;

                this.$store.dispatch('call', { api: 'zbGetdev' }).then(function (data) {
                    // _this.disconnnect_status = false;
                    // _this.connetc_status = false;
                    // _this.unconnectIndex = -1;
                    _this.handleIsConnectStatus = false;
                    _this.connectIndex = -1;
                    _this.knowlist = data.device_list || [];
                });
            },
            generateId: function generateId(name, id) {
                return name + "_" + id;
            },
            getOperationpage: function getOperationpage(item) {
                var _this2 = this;

                this.deviceData.mac = item.mac;
                this.deviceData.name = item.name;
                this.deviceData.manufacturer = item.manufacturer;
                this.deviceData.connection = item.handle;
                this.deviceData.address_type = item.address_type;
                if (!item.manufacturer) {
                    this.$store.dispatch('call', {
                        api: 'zbGetservice', data: {
                            mac: item.mac
                        }
                    }).then(function (result) {
                        _this2.deviceData.page = 'two';
                        _this2.serverlist = result.service_list;
                        for (var i in _this2.serverlist) {
                            _this2.serverlist[i].id = 'item' + i;
                        }
                        _this2.$router.push({ name: 'blelist', params: { deviceData: _this2.deviceData, serverlist: _this2.serverlist } }); //类似post传参
                    });
                } else {
                    this.deviceData.page = 'three';
                    this.deviceData.characteristic = item.key_handle;
                    this.$router.push({ name: 'blelist', params: { deviceData: this.deviceData } }); //类似post传参
                }
            },
            handleIsConnect: function handleIsConnect(item, index) {
                this.handleIsConnectStatus = true
                this.connectIndex = index;
                if (item.online == 1 || item.handle == 1) {
                    this.disConnect(item.handle, index)
                } else {
                    this.connect(item, index)
                }
            },
            // 断开连接
            disConnect: function disConnect(connectIndex, index) {
                var _this3 = this;

                // this.unconnectIndex = index;
                // this.disconnnect_status = true;
                this.$store.dispatch('call', {
                    api: 'zbDisconnect', data: {
                        connection: connectIndex
                    }
                }).then(function (result) {
                    if (result.success) {
                        _this3.$message({
                            type: 'success',
                            msg: result.code
                        });
                        setTimeout(function () {
                            _this3.getknowlist();
                        }, 3000);
                    }else {
                        _this3.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            // 设置连接蓝牙参数
            setConnpara: function setConnpara(item, index) {
                // this.connectIndex = index;
                // this.connetc_status = true;
                // this.connect(item, index);
            },
            // 连接蓝牙
            connect: function connect(item, index) {
                var _this4 = this;

                var api = 'zbConnect';
                if (item.manufacturer == 'MIPOW') {
                    api = 'zbConnect_mipow';
                }
                this.deviceData.manufacturer = item.manufacturer;
                this.deviceData.mac = item.mac;
                this.deviceData.name = item.name;
                this.deviceData.address_type = item.address_type;
                this.$store.dispatch('call', {
                    api: api, data: {
                        address: item.mac,
                        address_type: item.address_type // 0公共设备 1私密设备
                    }
                }).then(function (result) {
                    if (result.success) {
                        _this4.deviceData.connection = result.connection;
                        _this4.deviceData.characteristic = result.characteristic;
                        item.manufacturer == 'MIPOW' ? _this4.getService_mipow(result) : _this4.getService(result, item);
                    } else {
                        // _this4.connetc_status = false;
                        _this4.handleIsConnectStatus = false
                        _this4.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            // 获取已连接蓝牙设备支持的服务及列表 - mipow
            getService_mipow: function getService_mipow(result) {
                var _this5 = this;

                var that = this;
                this.$store.dispatch('call', {
                    api: 'zbGetscan_mipow', data: {
                        connection: result.connection,
                        characteristic: result.characteristic
                    }
                }).then(function (response) {
                    _this5.connetc_status = false;
                    if (response.success) {
                        _this5.$message({
                            type: 'success',
                            msg: result.code
                        });
                        _this5.deviceData.page = 'three';
                        _this5.$router.push({ name: 'blelist', params: { deviceData: _this5.deviceData } }); //类似post传参
                    } else {
                        _this5.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                    // $("#welcomeCarousel").carousel(2);
                });
            },
            // 获取已连接蓝牙设备支持的服务及列表
            getService: function getService(result, item) {
                var _this6 = this;

                this.$store.dispatch('call', {
                    api: 'zbPrimary', data: {
                        connection: result.connection
                    }
                }).then(function (result) {
                    if (result.success) {
                        setTimeout(function () {
                            _this6.$store.dispatch('call', {
                                api: 'zbGetservice', data: {
                                    mac: item.mac
                                }
                            }).then(function (result) {
                                _this6.serverlist = result.service_list;
                                for (var i in _this6.serverlist) {
                                    _this6.serverlist[i].id = 'item' + i;
                                }
                                _this6.deviceData.page = 'two';
                                _this6.$router.push({ name: 'blelist', params: { deviceData: _this6.deviceData, serverlist: _this6.serverlist } }); //类似post传参
                                _this6.connetc_status = false;
                            });
                        }, 2000);
                    } else{
                        _this6.$message({
                            type: 'error',
                            msg: result.code
                        });
                    }
                });
            },
            zbGetReboot: function zbGetReboot(){
                var that = this;
                this.rebootStatus = true;
                this.$store.dispatch("call",{
                    api : 'zbReboot'
                }).then(function (result){
                    if (result.success) {
                        setTimeout(function() {
                            that.$message({
                                type: 'success',
                                api: "zbReboot",
                                msg: result.code
                            });
                            that.getknowlist()
                            that.rebootStatus = false;
                        }, 2000);
                    } else {
                        that.$message({
                            type: 'error',
                            api: "zbReboot",
                            msg: result.code
                        });
                    }
                    
                })
            }
        },
        components: {
            'gl-btn': gl_btn,
            'gl-loading': gl_loading,
            'gl-input': gl_input
        }
    });
    return vueComponent;
});