"use strict";

define([
  "text!temple/share/index.html",
  "css!temple/share/index.css",
  "vue",
  "component/gl-toggle-btn/index",
  "component/gl-tooltip/index",
  "component/gl-btn/index",
  "component/gl-select/index",
], function (stpl, css, Vue, gl_switch, gl_tooltip, gl_btn, gl_select) {
  var vueComponent = Vue.extend({
    template: stpl,
    data: function data() {
      return {
        isShow: false,
        agreeStatus: false,
        applyStatus: true,
        msgOf_dmz: false,
        // dlna
        applyDlnaStatus: true, //是否禁用(true为禁用)
        currentDlnaDir: null,
        flagDlna: "",
        enableDlna: false,
        // samba
        flag: "", //第一次进入页面用于阻止应用按钮开启
        currentDir: null,
      };
    },
    components: {
      "gl-switch": gl_switch,
      "gl-tooltip": gl_tooltip,
      "gl-btn": gl_btn,
      "gl-select": gl_select,
    },
    beforeRouteEnter: function beforeRouteEnter(to, from, next) {
      next(function (vm) {
        $("#router-visual").slideUp();
        setTimeout(function () {
          if ($(".clsLink2" + vm.$route.path.split("/")[1]).hasClass("bar")) {
            $(".bar.active").removeClass("active");
            $(".clsLink2" + vm.$route.path.split("/")[1]).addClass("active");
            $("#vpn").collapse("hide");
            $("#moresetting").collapse("hide");
            $("#applications").collapse("hide");
            $("#system").collapse("show");
          }
        }, 50);
      });
    },
    mounted: function mounted() {
      var that = this;
      this.$store.dispatch("call", {
        api: "shareget"
      }).then(function (result) {
        // console.log(result);
      });
      this.$store.dispatch("call", {
        api: "getdlna"
      }).then(function (result) {
        // console.log(result);
      });
      that.$store.dispatch("call", {
        api: "fwget"
      }).then(function (result) {
        if (result.status == "Enabled") {
          that.msgOf_dmz = true;
        }
      });
    },
    computed: {
      shareget: function shareget() {
        var curList = this.$store.getters.apiData["shareget"];
        this.flag = curList.share_dir;
        this.currentDir = curList.share_dir;
        return this.$store.getters.apiData["shareget"];
      },
      dlnaget: function dlnaget() {
        var curList = this.$store.getters.apiData["getdlna"];
        this.flagDlna = curList.current;
        this.currentDlnaDir = curList.current;
        this.enableDlna = curList.enabled
        return this.$store.getters.apiData["getdlna"];
      },
      router: function router() {
        return this.$store.getters.apiData["router"];
      },
      dlnajudge: function dlnajudge() {
        if (this.router.model == 'mt1300') {
          return true
        }
        return false;
      }

    },
    methods: {
      checkApply: function checkApply() {
        this.applyStatus = false;
      },
      checkArgee: function checkArgee() {
        var that = this;
        if (this.shareget.samba_writable) {
          that.$store.commit("showModal", {
            show: true,
            title: "Caution",
            type: "warning",
            message: this.$lang.modal.usbUseInfo,
            yes: "Agree",
            no: "Cancel",
            cb: function cb() {
              that.applyStatus = false;
            },
            cancel: function cancel() {
              that.shareget.samba_writable = false;
            },
          });
        } else {
          that.applyStatus = false;
        }
      },
      // 改变目录
      changeCurDir: function changeSambaDir(type) {
        if (type == 'dlna' && this.currentDlnaDir != this.flagDlna) {
          this.applyDlnaStatus = false;
        } else if (type == 'damb' && this.currentDir != this.flag) {
          this.applyStatus = false;
        }
      },
      // 输入目录
      curInputDir: function inputSambaDir(type) {
        if (type == 'dlna') {
          this.applyDlnaStatus = false;
        } else if (type == 'samb') {
          this.applyStatus = false;
        }
      },
      setShare: function setShare() {
        var that = this;
        that.applyStatus = true;
        this.$store
          .dispatch("call", {
            api: "shareset",
            data: {
              path: that.currentDir ? that.currentDir : '',
              lan_share: that.shareget.share_on_lan,
              wan_share: that.shareget.share_on_wan,
              writable: that.shareget.samba_writable,
            },
          })
          .then(function (result) {
            if (result.success) {
              that.$message({
                type: "success",
                msg: result.code,
              });
            } else {
              that.$message({
                type: "error",
                msg: result.code,
              });
            }
          });
      },
      // set DLNA
      setDLNA: function setDLNA() {
        var that = this;
        that.$store
          .dispatch("call", {
            api: "setdlna",
            data: {
              enabled: that.enableDlna,
              current: that.currentDlnaDir,
            },
          })
          .then(function (result) {
            if (result.success) {
              that.$message({
                type: "success",
                msg: result.code,
              });
            } else {
              that.$message({
                type: "error",
                msg: result.code,
              });
            }
            that.applyDlnaStatus = true;
          });
      },
      checkDlnaApply: function checkDlnaApply() {
        this.applyDlnaStatus = false
      }
    },
  });
  return vueComponent;
});