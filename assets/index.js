webpackJsonp([0], {
    202: function(e, n, t) {
        "use strict";

        function a(e) {
            return "cameras." + e + ".snapshot"
        }

        function i(e) {
            return "cameras." + e + ".control"
        }

        function o(e) {
            return "cameras." + e + ".alerts"
        }

        function r(e, n) {
            return "cameras." + e + ".archives." + n
        }
        e.exports = function(e) {
            function n(e) {
                for (var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = "", a = 0; a < e; a++) {
                    var i = Math.floor(Math.random() * n.length);
                    t += n.substring(i, i + 1)
                }
                return t
            }

            function c(e, n) {
                p.ajax({
                    type: "GET",
                    url: e,
                    dataType: "json",
                    beforeSend: function(e) {
                        e.setRequestHeader("X-Twilio-Token", b)
                    },
                    success: function(e, t, a) {
                        n(e.links.content_direct_temporary)
                    }
                })
            }

            function l(n) {
                c(n.snapshot.mcs_url, function(t) {
                    n.snapshotLoadingInProgress || (n.snapshotLoadingInProgress = !0, n.snapshot.img_url = t, console.info("Loading image: " + n.snapshot.img_url)), e.refresh()
                })
            }

            function s(e) {
                v.document(a(e.info.id)).then(function(n) {
                    e.snapshotDocument = n, e.snapshot = n.value, l(e), n.on("updated", function(n) {
                        console.log("camera snapshot updated", e.info.id, JSON.stringify(n)), e.snapshot = n, l(e)
                    })
                })
            }

            function d(n) {
                v.map(i(n.info.id)).then(function(t) {
                    Promise.all([t.get("preview"), t.get("alarm"), t.get("arm")]).then(function(a) {
                        n.controlMap = t, n.control = {
                            preview: a[0].value,
                            alarm: a[1].value,
                            arm: a[2].value
                        }, console.log("camera control fetched", n.info.id, JSON.stringify(n.control)), t.on("itemUpdated", function(t) {
                            console.log("camera control updated", n.info.id, t.key, JSON.stringify(t.value)), n.control[t.key] = t.value, e.refresh()
                        }), e.refresh()
                    })
                })
            }

            function m() {
                var e = [];
                for (var n in w.value.cameras) {
                    var t = w.value.cameras[n];
                    t.id === n && "string" == typeof t.name && "string" == typeof t.contact_number && "string" == typeof t.twilio_sim_sid ? n in C ? t.name === C[n].info.name && t.contact_number === C[n].info.contact_number && t.twilio_sim_sid === C[n].info.twilio_sim_sid || (console.log("Updating camera", t), C[n].info = t) : (console.log("Loading new camera", t), C[n] = {
                        info: t
                    }, s(C[n]), d(C[n])) : (console.warn("Invalid camera configuration, removing from the list: ", n, t), e.push(n))
                }
                for (var n in C) n in w.value.cameras || (console.log("Deleting camera", t), C[n].snapshotDocument && C[n].snapshotDocument.removeAllListeners("updated"), C[n].controlMap && C[n].controlMap.removeAllListeners("itemUpdated"), delete C[n]);
                return e
            }

            function u(e, n) {
                return e.id && e.id.match(/^[a-zA-Z0-9]+$/) ? e.name ? e.contact_number && e.contact_number.match(/^[0-9]+$/) ? !(!e.twilio_sim_sid || !e.twilio_sim_sid.match(/^DE[a-z0-9]{32}$/)) || (n("camera sim SID is invalid: " + e.twilio_sim_sid), !1) : (n("camera contact number is invalid(only digits allowed): " + e.contact_number), !1) : (n("camera name is not specified"), !1) : (n("camera id is invalid: " + e.id), !1)
            }

            function f() {
                var e = n(16);
                return {
                    token: e,
                    hash: h.createHash("sha512").update(e).digest("hex")
                }
            }
            const p = t(4),
                h = t(43),
                g = t(322).Client;
            var v, b, w, C = {};
            return {
                initialized: p.Deferred(),
                cameras: C,
                updateToken: function(e) {
                    var n = this;
                  //The line "/userauthenticate" was updated to "/userauthenticator" to match Twilio BluePrint
                    return p.get("/userauthenticator?username=twilio&pincode=928462", function(t) {
                        t.success ? (console.log("token updated:", t), b = t.token, v ? v.updateToken(b) : v = new g(b), e && e(b), setTimeout(n.updateToken.bind(n), 1e3 * t.ttl * .96)) : console.error("failed to authenticate the user: ", t.error)
                    }).fail(function(e, t, a) {
                        console.error("failed to send authentication request:", t, a), setTimeout(n.updateToken.bind(n), 1e4)
                    })
                },
                fetchConfiguration: function() {
                    return v.document("app.configuration").then(function(e) {
                        w = e;
                        var n, t = null;
                        return e.value.cameras ? (n = m(), n.length && (null === t && (t = p.extend(!0, e.value, {})), n.forEach(function(e) {
                            delete t.cameras[e]
                        }))) : (console.warn("cameras is not configured, creating an empty list"), null === t && (t = p.extend(!0, e.value, {})), t.cameras = {}), t
                    }).then(function(e) {
                        if (null !== e) return w.set(e).then(function() {
                            console.log("app configuration updated with new value:", e)
                        })
                    })
                },
                addCamera: function(n, t) {
                    if (u(n, t)) {
                        if (n.id in w.value.cameras) return t("Camera with the same ID exists");
                        n.created_at = (new Date).getTime();
                        var a = f();
                        n.hash = a.hash, w.mutate(function(e) {
                            return e.cameras || (e.cameras = {}), e.cameras[n.id] = n, e
                        }).then(function() {
                            return Promise.all([v.map(i(n.id)).then(function(e) {
                                return Promise.all[(e.set("alarm", {
                                    id: -1
                                }), e.set("arm", {
                                    enabled: !0,
                                    responded_alarm: -1
                                }), e.set("preview", {
                                    enabled: !1
                                }))]
                            }), v.list(o(n.id))])
                        }).then(function() {
                            m(), t(null, p.extend(!0, C[n.id].info, {
                                token: a.token
                            })), e.refresh()
                        }).catch(function(e) {
                            t(e)
                        })
                    }
                },
                updateCamera: function(n, t) {
                    w.mutate(function(e) {
                        return n.id in e.cameras ? e.cameras[n.id] = p.extend(!0, n, {
                            hash: e.cameras[n.id].hash
                        }) : t("Camera is not in the list"), e
                    }).then(function() {
                        m(), t(null), e.refresh()
                    }).catch(function(e) {
                        t(e)
                    })
                },
                regenToken: function(n, t) {
                    var a = f();
                    w.mutate(function(e) {
                        if (!(n in e.cameras)) throw "unknown camera: " + n;
                        return e.cameras[n].hash = a.hash, e
                    }).then(function() {
                        m(), t(p.extend(!0, C[n].info, {
                            token: a.token
                        })), e.refresh()
                    }).catch(function(e) {
                        console.error("regenToken", e)
                    })
                },
                deleteCamera: function(n) {
                    w.mutate(function(e) {
                        return delete e.cameras[n], e
                    }).then(function() {
                        m(), e.refresh()
                    }).then(function() {
                        v.map(i(n)).then(function(e) {
                            e.removeMap()
                        }), v.list(o(n)).then(function(e) {
                            e.removeList()
                        })
                    })
                },
                controlPreview: function(e) {
                    var n = C[e];
                    n.controlMap.set("preview", n.control.preview).then(function() {
                        console.log("switchPreview updated", e, n.control.preview)
                    }).catch(function(e) {
                        console.err("switchPreview failed", e)
                    })
                },
                controlArm: function(e) {
                    var n = C[e];
                    n.controlMap.set("arm", n.control.arm).then(function() {
                        console.log("switchArm updated", e, n.control.arm)
                    }).catch(function(e) {
                        console.err("switchArm failed", e)
                    })
                },
                disarm: function(e) {
                    var n = C[e];
                    n.controlMap.set("arm", {
                        enabled: n.control.arm.enabled,
                        responded_alarm: n.control.alarm.id
                    }).then(function() {
                        console.log("disarm updated", e, n.control.arm)
                    }).catch(function(e) {
                        console.err("disarm failed", e)
                    })
                },
                getAlerts: function(e, n) {
                    v.list(o(e)).then(function(e) {
                        return e.getItems({
                            order: "desc"
                        }).then(function(e) {
                            console.log("getAlerts", e), n(e.items)
                        })
                    }).catch(function(e) {
                        console.error("getAlerts failed", e)
                    })
                },
                getNextArchivedSnapshot: function(e, n, t, a) {
                    v.list(r(e, n)).then(function(e) {
                        return e.get(t)
                    }).then(function(e) {
                        c(e.data.value.mcs_url, function(e) {
                            a(e)
                        })
                    }).catch(function(e) {
                        console.info("getNextArchivedSnapshot failed", e), a(null)
                    })
                },
                init: function() {
                    var n = this;
                    this.updateToken(function(t) {
                        n.fetchConfiguration().then(function() {
                            e.refresh()
                        }).then(function() {
                            n.initialized.resolve()
                        })
                    })
                }
            }
        }
    },
    203: function(e, n, t) {
        var a = t(4),
            i = {
                templateUrl: t(295),
                init: function(app, e) {
                    e.cameras = app.cameras, e.newCamera = {}, e.addCamera = function() {
                        app.addCamera(angular.copy(e.newCamera), function(n, t) {
                            n ? a("#add-camera-failed").text(JSON.stringify(n)) : (e.editedCameraInfo = t, a(".add-camera").hide(), a(".add-camera-show").fadeIn(333), e.$apply())
                        })
                    }, e.editCamera = function(n) {
                        e.editedCameraInfo = app.cameras[n].info, a(".edit-camera").fadeIn(333)
                    }, e.updateCamera = function() {
                        app.updateCamera(angular.copy(e.editedCameraInfo), function(n) {
                            n ? a("#edit-camera-failed").text(JSON.stringify(n)) : (a(".edit-camera").hide(), e.$apply())
                        })
                    }, e.deleteCamera = function(e) {
                        app.deleteCamera(e)
                    }, e.regenTokenForCamera = function(n) {
                        app.regenToken(n, function(n) {
                            e.editedCameraInfo = n
                        })
                    }, a(".add-camera-show").click(function() {
                        a(this).hide(), a(".add-camera").fadeIn(333)
                    }), a(".add-camera-cancel").click(function() {
                        a(".add-camera").hide(), a(".add-camera-show").fadeIn(333)
                    }), a(".edit-camera-cancel").click(function() {
                        e.editedCameraInfo = null, a(".edit-camera").hide(), e.$apply()
                    })
                }
            };
        e.exports = i
    },
    204: function(e, n, t) {
        var a = (t(4), {
            templateUrl: t(296),
            init: function(app, e, n) {
                n.camera = app.cameras[e], n.selectedAlertChanged = function() {
                    console.log("selectedAlertChanged", n.selectedAlertId), n.selectedArchiveId = 0, n.selectNewArchiveId(0), n.snapshotTmpUrl = null
                }, n.selectNewArchiveId = function(t) {
                    console.log("selectNewArchiveId start", n.selectedAlertId, t), app.getNextArchivedSnapshot(e, n.selectedAlertId, t, function(e) {
                        e ? (console.log("selectNewArchiveId accepted", n.selectedAlertId, e), n.selectedArchiveId = t, n.snapshotTmpUrl = e, n.$apply()) : console.log("selectNewArchiveId rejected", n.selectedAlertId)
                    })
                }, n.selectPreviousArchive = function() {
                    n.selectedArchiveId > 0 && n.selectNewArchiveId(n.selectedArchiveId - 1)
                }, n.selectNextArchive = function() {
                    n.selectNewArchiveId(n.selectedArchiveId + 1)
                }, app.getAlerts(e, function(e) {
                    n.alerts = e, n.selectedAlertId = e[0].data.index + "", n.$apply(), n.selectedAlertChanged()
                })
            }
        });
        e.exports = a
    },
    205: function(e, n, t) {
        var a = {
            templateUrl: t(297),
            init: function(app, e) {
                e.cameras = app.cameras, e.modes = ["live-feed", "arm"], e.noCamera = function() {
                    return 0 === Object.keys(app.cameras).length
                }, e.update = function(e, n) {
                    "live-feed" == e ? (n.control.preview.enabled = !0, n.control.arm.enabled = !1) : (n.control.preview.enabled = !1, n.control.arm.enabled = !0), app.controlPreview(n.info.id), app.controlArm(n.info.id), console.log(n.info)
                }, e.img_oninit = function(e) {
                    e.snapshotLoadingInProgress = !1
                }, e.img_onloaded = function(e) {
                    console.info("Image loaded: " + e.snapshot.img_url), e.snapshotLoadingInProgress = !1
                }, e.switchPreview = function(e) {
                    app.controlPreview(e)
                }, e.switchArm = function(e) {
                    app.controlArm(e)
                }, e.disarm = function(e) {
                    app.disarm(e)
                }
            }
        };
        e.exports = a
    },
    207: function(e, n, t) {
        e.exports = t.p + "index.html"
    },
    208: function(e, n) {
        e.exports = angular
    },
    209: function(e, n) {
        e.exports = void 0
    },
    210: function(e, n, t) {
        "use strict";
        const a = t(4),
            i = t(208),
            o = t(0);
        t(209);
        t(30), t(31), t(207);
        const r = t(205),
            c = t(203),
            l = t(204);
        var s, d, App = t(202);
        window.app = new App({
            refresh: function() {
                d.$apply()
            }
        }), i.module("app", ["ngRoute"]).controller("DashboardViewCtrl", ["$scope", function(e) {
            d = e, s = r, a.when(app.initialized).done(function() {
                r.init(app, e)
            })
        }]).controller("CameraListViewCtrl", ["$scope", function(e) {
            d = e, s = c, a.when(app.initialized).done(function() {
                c.init(app, e)
            })
        }]).controller("CameraView", ["$routeParams", "$scope", function(e, n) {
            d = n, s = l, a.when(app.initialized).done(function() {
                l.init(app, e.id, n)
            })
        }]).config(["$routeProvider", function(e) {
            e.when("/dashboard", {
                controller: "DashboardViewCtrl",
                templateUrl: r.templateUrl
            }).when("/cameras", {
                controller: "CameraListViewCtrl",
                templateUrl: c.templateUrl
            }).when("/cameras/:id", {
                controller: "CameraView",
                templateUrl: l.templateUrl
            }).otherwise({
                redirectTo: "/dashboard"
            })
        }]).filter("moment", function() {
            return function(e) {
                return o(e).format("MMM DD YYYY @ hh:mm")
            }
        }).directive("imageloaded", function() {
            return {
                restrict: "A",
                link: function(e, n, t) {
                    n.bind("load", function() {
                        e.$apply(t.imageloaded)
                    })
                }
            }
        })
    },
    295: function(e, n) {
        var t = "views/camera_list.html";
        window.angular.module("ng").run(["$templateCache", function(e) {
            e.put(t, '<div class="row">\n  <div class="col-lg-12">\n    <div class="page-header">\n      <h1 id="tables">Configuration</h1>\n    </div>\n\n    <div class="bs-component">\n      <table class="table table-striped table-hover">\n        <thead>\n          <tr>\n            <th><strong>Id</strong></th>\n            <th><strong>Name</strong></th>\n            <th><strong>Phone Number</strong></th>\n            <th><strong>SIM Sid</strong></th>\n            <th><strong>Token</strong></th>\n            <th><strong>Created</strong></th>\n            <th><strong>Actions</strong></th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr ng-repeat="camera in cameras" class="chalk-background" ng-class="{\'text-success\': editedCameraInfo.id === camera.info.id}">\n            <td>{{ camera.info.id }}</td>\n            <td>{{ camera.info.name }}</td>\n            <td>{{ camera.info.contact_number }}</td>\n            <td>{{ camera.info.twilio_sim_sid }}</td>\n            <td>\n                <small ng-if="editedCameraInfo.id === camera.info.id" class="text-warning">{{ editedCameraInfo.token }}</small>\n                <button ng-click="regenTokenForCamera(camera.info.id)" ng-if="editedCameraInfo.id !== camera.info.id" class="btn btn-xs btn-success">Regenerate</button>\n            </td>\n            <td>{{ camera.info.created_at | moment }}</td>\n            <td>\n                <button ng-click="editCamera(camera.info.id)" class="btn btn-xs btn-success">Edit</button>\n                &nbsp;\n                <button ng-click="deleteCamera(camera.info.id)" class="btn btn-xs btn-danger">Delete</button>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    <div id="source-button" class="btn btn-primary btn-xs" style="display: none;">&lt; &gt;</div></div>\x3c!-- /example --\x3e\n  </div>\n</div>\n\n<button class="btn btn-primary add-camera-show">New Security Camera</button>\n\n<div class="row add-camera chalk-background">\n  <div class="col-lg-12">\n    <form class="form-horizontal" ng-submit="addCamera()">\n      <fieldset>\n        <h2>Add Security Camera</h2>\n\n        <div class="form-group">\n          <label for="id" class="col-lg-2">Id</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="newCamera.id" id="id" placeholder="">\n            <p>This can be any unique alphanumeric identifier.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="name" class="col-lg-2">Name</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="newCamera.name" id="name" placeholder="">\n            <p>Give your Security Camera a descriptive name for the dashboard.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="contact_number" class="col-lg-2">Phone Number</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="newCamera.contact_number" id="contact_number" placeholder="">\n            <p>The phone number that receives text notifications.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="twilio_sim_sid" class="col-lg-2">Twilio SIM Sid</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="newCamera.twilio_sim_sid" id="twilio_sim_sid" placeholder="">\n            <p>You can find your SIM Sid in Twilio\'s <a href="https://www.twilio.com/console/wireless/sims/">Console</a>.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <div class="col-lg-12">\n            <button type="submit" class="btn btn-primary">Submit</button>\n            <button type="reset" class="btn btn-default add-camera-cancel">Cancel</button>\n          </div>\n        </div>\n\n        <p class="text-warning" id="add-camera-failed"></p>\n      </fieldset>\n    </form>\n  </div>\n</div>\n\n<div class="row edit-camera">\n  <div class="col-lg-12">\n    <form class="form-horizontal" ng-submit="updateCamera()">\n      <fieldset>\n        <legend>Update Security Camera</legend>\n\n        <div class="form-group">\n          <label for="id" class="col-lg-2">Id</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="editedCameraInfo.id" id="id" value="{{ editedCameraInfo.id }}" placeholder="" disabled>\n            <p>This can be any unique alphanumeric identifier.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="name" class="col-lg-2">Name</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="editedCameraInfo.name" id="name" value="{{ editedCameraInfo.name }}" placeholder="">\n            <p>Give your Security Camera a descriptive name for the dashboard.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="contact_number" class="col-lg-2">Phone Number</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="editedCameraInfo.contact_number" id="contact_number" value="{{ editedCameraInfo.contact_number }}" placeholder="">\n            <p>This is the phone number that receives text notifications.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <label for="twilio_sim_sid" class="col-lg-2">Twilio SIM Sid</label>\n          <div class="col-lg-12">\n            <input type="text" class="form-control" ng-model="editedCameraInfo.twilio_sim_sid" id="twilio_sim_sid" value="{{ editedCameraInfo.twilio_sim_sid }}" placeholder="">\n            <p>You can find your SIM Sid in Twilio\'s <a href="https://www.twilio.com/console/wireless/sims/">Console</a>.</p>\n          </div>\n        </div>\n\n        <div class="form-group">\n          <div class="col-lg-10">\n            <button type="submit" class="btn btn-primary">Submit</button>\n            <button type="reset" class="btn btn-default edit-camera-cancel">Cancel</button>\n          </div>\n        </div>\n\n        <p class="text-warning" id="edit-camera-failed"></p>\n      </fieldset>\n    </form>\n  </div>\n</div>\n')
        }]), e.exports = t
    },
    296: function(e, n) {
        var t = "views/camera_view.html";
        window.angular.module("ng").run(["$templateCache", function(e) {
            e.put(t, '<div class="archive-notification" ng-show="!snapshotTmpUrl">\n  <h1>No Security Camera Alerts</h1>\n  <p>No notifications have been logged.</p>\n</div>\n\n<div ng-show="!!snapshotTmpUrl">\n  <h1>{{ camera.info.name }}</h1>\n\n  <div class="alerts-list">\n    <span>Select an alert to view\n      <select class="form-control" id="alertSelect" ng-model="selectedAlertId" ng-change="selectedAlertChanged()">\n        <option value="" selected>Click to select</option>\n        <option ng-repeat="alert in alerts" value="{{alert.data.index}}">{{alert.data.index}} : {{alert.data.value.datetime_utc | moment}}</option>\n      </select>\n    </span>\n  </div>\n\n  <div class="archive-view row chalk-background">\n    <div class="camera-feed buffer">\n      <img ng-src="{{ snapshotTmpUrl }}" />\n    </div>\n  </div>\n\n  <div class="row navigate-archive">\n      <a href="" ng-click="selectPreviousArchive()">&lt;Previous</a> |\n      <a href="" ng-click="selectNextArchive()">Next &gt;</a>\n  </div>\n</div>\n')
        }]), e.exports = t
    },
    297: function(e, n) {
        var t = "views/dashboard.html";
        window.angular.module("ng").run(["$templateCache", function(e) {
            e.put(t, '<h1>Active Security Cameras</h1>\n\n<p ng-show="noCamera()">We aren\'t tracking any Security Cameras right now. Click the Add Security Camera button to get started.</p>\n\n<div ng-repeat="camera in cameras" class="jumbotron camera camera{{ camera.info.id }} chalk-background">\n  <h3>\n    <span>{{ camera.info.name }}</span>\n    <div>\n      <span class="small">Select the mode for your camera</span>\n        <select class="selectpicker small"\n          ng-model="selectedCameraMode"\n          ng-init="selectedCameraMode = camera.control.preview.enabled ? \'live-feed\' : \'arm\'"\n          ng-change="update(selectedCameraMode, camera)">\n            <option value="">Click to select</option>\n            <option value="live-feed" ng-selected="camera.control.preview.enabled">Live Feed</option>\n            <option value="arm" ng-selected="camera.control.arm.enabled">Armed</option>\n        </select>\n    </div>\n  </h3>\n\n  <div class="row">\n    <div class="col-lg-8 col-lg-offset-2 img-parent">\n      <div class="camera-feed">\n        <img ng-src="{{ camera.snapshot.img_url }}" ng-init="img_oninit(camera)" imageloaded="img_onloaded(camera)"/>\n      </div>\n    </div>\n  </div>\n  <div class="row motion_stats">\n    <div class="col-lg-4 col-lg-offset-4">\n      <div class="alert alert-success" ng-if="camera.control.alarm.id === camera.control.arm.responded_alarm">\n        <strong>No Active Alarm</strong>\n      </div>\n      <button class="alert alert-danger" ng-if="camera.control.alarm.id !== camera.control.arm.responded_alarm" ng-click="disarm(camera.info.id)">\n        <strong>Dismiss Alarm</strong>\n      </button>\n      <div>\n        <a href="#!/cameras/{{ camera.info.id }}">Browse archived alerts</a>\n      </div>\n    </div>\n  </div>\n</div>\n')
        }]), e.exports = t
    },
    322: function(e, n) {
        e.exports = Twilio.Sync
    }
}, [210]);
//# sourceMappingURL=index.js.map
