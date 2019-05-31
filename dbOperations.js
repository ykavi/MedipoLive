const sql = require('mssql')
var webconfig = {
    user: 'dogukan00',
    password: 'dogukan.12',
    server: 'MpChats.mssql.somee.com',
    database: 'MpChats',
    port: 1433
};
/*
var webconfig = {
    user: 'dogukan',
    password: 'Prepernburn2',
    server: 'dogukan12.database.windows.net',
    database: 'MpChat',
    options: {
        encrypt: true
    }
};
*/
const pool2 = new sql.ConnectionPool(webconfig)
const pool2Connect = pool2.connect()

pool2.on('error', err => {
    debugger
})

module.exports.memberinsert = function (req, res) {
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("Select dbo.fn_UyeKontrol('" + req.body.KullaniciAd + "','" + req.body.Eposta + "') as UyeKontrol", function (err, Kontrol) {
                if (err) {
                    console.log(err);
                }
                Kontrol.recordset.forEach(function (kullanici) {
                    if (kullanici.UyeKontrol == "Evet") {
                        res.render('UyeOl', { hata: 'Kullanıcı adı veya e posta bulunmaktadır !' });
                        sql.close();
                    } else {
                        pool.request() // or: new sql.Request(pool2)
                            .query("insert into Kullanici(KullaniciAd,Sifre,Email,GuvenlikSorusu,Cevap) values ('" + req.body.KullaniciAd + "','" + req.body.Sifre + "','" + req.body.Eposta + "','" + req.body.Soru + "','" + req.body.Cevap + "')", function (err, recordset) {
                                if (err) {
                                    console.log(err);
                                }
                                res.render('giris', { hata: '' });
                                sql.close();
                            })
                    }

                })
            });

    }).catch(err => {
        // ... error handler
    })

}
module.exports.UyeOl = function (req, res) {
    res.render('UyeOl', { hata: '' });
}
module.exports.Giris = function (req, res) {
    res.render('giris', { hata: '' });
}

module.exports.HesapSilindi = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("delete from kullanici where Id=" + req.params.id + "", function (err, verisonucu) {
                if (err) {
                    console.log(err);
                }
                sql.close();
                res.render('giris', { hata: '' });

            })
    }).catch(err => {
        // ... error handler
    });
}
module.exports.GirisYapildi = function (req, res) {

    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("Select dbo.fn_AdminVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, verisonucu) {
                if (err) {
                    return console.error(err)
                }
                verisonucu.recordset.forEach(function (kullanici) {
                    if (kullanici.Sonuc == "Evet") {
                        req.session.nick = req.body.ad;
                        pool.request()
                            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                                if (err) {
                                    console.log(err);
                                }
                                req.session.sheld = true;
                                res.render('admin', { nick: req.body.ad, kullanici: kullanicilar.recordset });
                            });
                    }

                });
            });
      
            pool.request() // or: new sql.Request(pool2)
                    .query(" Select dbo.fn_BanVarmi('"+req.body.ad+"') as Sonuc  ", function (err, ban) {
                        if (err) {
                            return console.error(err)
                        }
      
                pool.request() // or: new sql.Request(pool2)
                    .query("Select dbo.fn_UyeVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, verisonucu) {
                        if (err) {
                            return console.error(err)
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("Select dbo.fn_AdminVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, admin) {
                                if (err) {
                                    return console.error(err)
                                }
                                ban.recordset.forEach(function (banlar) {
                                    if (banlar.Sonuc == "Evet") {
                                        res.render('giris', { hata: 'Hesabınız kalıcı süreyle kapatılmıştır!' })
                                    }
                                    else{
                                verisonucu.recordset.forEach(function (kullanici) {
                                    admin.recordset.forEach(function (admin) {
                                        if (admin.Sonuc == "Evet") {
                                            req.session.nick = req.body.ad;
                                            pool.request()
                                                .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    req.session.sheld = true;
                                                    res.render('admin', { nick: req.body.ad, kullanici: kullanicilar.recordset });
                                                });
                                        }
                                        else if (kullanici.Sonuc == "Evet") {

                                            req.session.nick = req.body.ad;
                                            pool.request()
                                                .query("insert into AktifKullanici values('" + req.body.ad + "',GETDATE())", function (err, recordset) {

                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    pool.request()
                                                        .query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Genel' and m.userID = k.Id", function (err, mesajlar) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            pool.request()
                                                                .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    }
                                                                    req.session.sheld = true;
                                                                    res.render('genel', { nick: req.body.ad, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                                                                });
                                                        });
                                                });
                                        }
                                        else {
                                            res.render('giris', { hata: 'Kullanici Adi veya Şifre Hatalı !' })

                                        }
                                    });
                                });
                            }
                            });
                            });
                    });
                });
                
         
        

    }).catch(err => {
        // ... error handler
    })


}

module.exports.msgEkle = async function (msg, nick, oda, req, res) {
    /*sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("insert into Mesajlar VALUES ('" + msg + "',(select Id from Kullanici where KullaniciAd = '" + nick + "'),GETDATE(),'" + oda + "'", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            sql.close();
        });
    });*/
    //const pool = new sql.ConnectionPool(webconfig);

    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("insert into Mesajlar VALUES ('" + msg + "',(select Id from Kullanici where KullaniciAd = '" + nick + "'),GETDATE(),'" + oda + "')").then(function (params2) {
                console.dir(params2)
                return params2;


            })
    }).catch(err => {
        // ... error handler
    })

    // or: new sql.Request(pool1)

    // pool.query("insert into Mesajlar VALUES ('" + msg + "',(select Id from Kullanici where KullaniciAd = '" + nick + "'),GETDATE(),'" + oda + "'", function (err, rows, fields) {
    //     if (err) throw err;

    //     console.log('The solution is: ', rows[0].solution);
    // });

}/*
module.exports.GirisYapildi = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("Select dbo.fn_UyeVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            verisonucu.recordset.forEach(function (kullanici) {
                if (kullanici.Sonuc == "Evet") {
                    req.session.nick = req.body.ad;
                    var request1 = new sql.Request();
                    request1.query("insert into AktifKullanici values('" + req.body.ad + "',GETDATE())", function (err, recordset) {
                        if (err) {
                            console.log(err);
                        }
                        request1.query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Genel' and m.userID = k.Id", function (err, mesajlar) {
                            if (err) {
                                console.log(err);
                            }
                            request1.query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                                if (err) {
                                    console.log(err);
                                }
                                sql.close();
                                res.render('genel', { nick: req.body.ad, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                            });
                        });
                    });
                }
                else {
                    res.render('giris', { hata: 'Kullanici Adi veya Şifre Hatalı !' })
                    sql.close();
                }
            });
        });
    });
}
*/

module.exports.getMsgKuzey = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Kuzey' and m.userID = k.Id", function (err, mesajlar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('kuzey', { nick: req.session.nick, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.getMsgGuney = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Güney' and m.userID = k.Id", function (err, mesajlar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('guney', { nick: req.session.nick, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.getMsgHalic = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Haliç' and m.userID = k.Id", function (err, mesajlar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('halic', { nick: req.session.nick, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.getGenel = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select m.Id,m.msg,m.userID,convert(varchar, getdate(), 105) as eklenmeTarihi,m.odaAdi,k.Id,k.KullaniciAd from Mesajlar m,kullanici k where odaAdi = 'Genel' and m.userID = k.Id", function (err, mesajlar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('genel', { nick: req.session.nick, mesajlar: mesajlar.recordset, kullanici: kullanicilar.recordset });
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.sifre = function (req, res) {
    res.render('sifre', { hata: '' });
}
module.exports.YeniSifre = function (req, res) {
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query(" Select dbo.fn_SifreYenileme('" + req.body.Email + "','" + req.body.Cevaps + "') as SifreSonuc", function (err, verisonucu) {
                if (err) {
                    console.log(err);
                }
                verisonucu.recordset.forEach(function (kullanici) {
                    if (kullanici.SifreSonuc == "Evet") {
                        res.render('SifreYenileme', { Email: req.body.Email, Cevap: req.body.Cevaps, soru: req.body.soru, hata: '' });
                    }
                    else {
                        res.render('sifre', { hata: 'Lütfen bilgilerinizi kontrol ediniz !' })
                    }
                });
                sql.close();
            });

    }).catch(err => {
        // ... error handler
    })

}

module.exports.sifreUpdate = function (req, res) {
    if (req.body.password1 != req.body.password2) {
        res.render('SifreYenileme', { Email: req.body.Email, Cevap: req.body.Cevaps, soru: req.body.soru, hata: 'Şifreler Uyuşmuyor !' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("update kullanici set Sifre='" + req.body.password1 + "' where Email='" + req.body.Email + "' and Cevap='" + req.body.Cevaps + "'", function (err, verisonucu) {
                if (err) {
                    console.log(err);
                }
                res.render('giris', { hata: '' })
                sql.close();

            })
    }).catch(err => {
        // ... error handler
    })
}

module.exports.hesap = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select Id,KullaniciAd,Sifre,Email,Cevap,GuvenlikSorusu from kullanici where KullaniciAd='" + req.session.nick + "'  ", function (err, hesap) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from guvenlikSorusu", function (err, soru) {
                        hesap.recordset.forEach(function (kullanici) {
                            res.render('hesap', { soru: soru.recordset, nickname: kullanici.KullaniciAd, password: kullanici.Sifre, Email: kullanici.Email, reply: kullanici.Cevap, hata: '', nick: req.body.ad, question: kullanici.GuvenlikSorusu, Id2: kullanici.Id });
                        });
                        sql.close();
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.hesapupdate = function (req, res) {

    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request().query("update kullanici set kullaniciAd='" + req.body.mynickname + "'  ,Email='" + req.body.Email + "', Sifre='" + req.body.mypassword + "',GuvenlikSorusu='" + req.body.Soru + "', Cevap='" + req.body.myreply + "' where KullaniciAd='" + req.session.nick + "' or KullaniciAd='" + req.body.mynickname2 + "' ", function (err, hesap) {
            if (err) {
                console.log(err);
            }
            pool.request().query("select * from kullanici where KullaniciAd='" + req.body.mynickname + "'", function (err, hesaplar) {
                if (err) {
                    console.log(err);
                }
                pool.request().query("select * from guvenlikSorusu", function (err, soru) {
                    hesaplar.recordset.forEach(function (kullanici) {
                        res.render('hesap', { soru: soru.recordset, nickname: kullanici.KullaniciAd, password: kullanici.Sifre, Email: kullanici.Email, reply: kullanici.Cevap, hata: 'Hesabınız başarıyla güncellendi', nick: req.body.ad, question: kullanici.GuvenlikSorusu, Id2: kullanici.Id });
                    });
                    sql.close();
                })
            });
        });
    }).catch(err => {
        // ... error handler
    })
}

module.exports.GetOneri = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }

    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                sql.close();
                res.render('oneri', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '' });
            })
    }).catch(err => {
        // ... error handler
    })
}
module.exports.PostOneri = function (req, res) {

    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("insert into Oneriler Values('" + req.body.oneri + "','" + req.body.konu + "',(select Id from kullanici where KullaniciAd='" + req.session.nick + "'),GETDATE(),'Oneriler')", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request()
                    .query("select * from kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }

                        res.render('oneri', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'İletiniz başarıyla gönderilmiştir.' });
                    })
            })
    }).catch(err => {
        // ... error handler
    })
}
module.exports.GetAdmin = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }

                res.render('admin', { nick: req.session.nick, kullanici: kullanicilar.recordset });
            });

    }).catch(err => {
        // ... error handler
    })

}

module.exports.GetAdminOneriler = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select o.Id,k.KullaniciAd,o.konu from Oneriler o,kullanici k where o.userID=k.Id", function (err, Oneriler) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, kod: '' });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}

module.exports.PostAdminOneriler = function (req, res) {

    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select o.Id,msg,k.KullaniciAd,o.konu from Oneriler o,kullanici k where o.userID=k.Id and o.Id=" + req.body.no + "", function (err, Oneriler) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)


                        res.render('AdminOneriGorus', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, no: req.body.no });

                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.GetAdminOneriGorus = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select o.Id,msg,k.KullaniciAd,o.konu from Oneriler o,kullanici k where o.userID=k.Id  ", function (err, Oneriler) {
                        if (err) {
                            console.log(err);
                        }


                        res.render('AdminOneriGorus', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, no: req.body.no });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.PostAdminOneriGorus = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("delete from Oneriler where Id= " + req.body.no + " ", function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)

                            .query("   select o.Id,k.KullaniciAd,o.konu from Oneriler o,kullanici k where o.userID=k.Id", function (err, Oneriler) {
                                if (err) {
                                    console.log(err);
                                }
                                res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset });
                            });


                    });
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.silMsg = function (nick, msg, oda, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("delete Mesajlar where Id = (select  max(Id) as Id from mesajlar where odaAdi = '" + oda + "' and msg = '" + msg + "' and userID in(select Id from Kullanici where KullaniciAd = '" + nick + "'))", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.silMsgDB = function (msgId, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("delete Mesajlar where Id = " + msgId + "", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.sikayetEt = function (msgId, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("insert into sikayetMsj(mesajId) VALUES (" + msgId + ")", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.sikayetEtADD = function (nick, msg, odaAdi, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("insert into sikayetMsj(nick,mesaj,odaAdi) VALUES ('" + nick + "','" + msg + "','" + odaAdi + "')", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}

module.exports.AdminHesap = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("select Id,KullaniciAd,Sifre,Email,Cevap,GuvenlikSorusu from Adminler where KullaniciAd='" + req.session.nick + "'  ", function (err, hesap) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from guvenlikSorusu", function (err, soru) {
                        hesap.recordset.forEach(function (kullanici) {
                            res.render('adminhesap', { soru: soru.recordset, nickname: kullanici.KullaniciAd, password: kullanici.Sifre, Email: kullanici.Email, reply: kullanici.Cevap, hata: '', nick: req.body.ad, question: kullanici.GuvenlikSorusu, Id2: kullanici.Id });
                        });
                        sql.close();
                    })
            });
    }).catch(err => {
        // ... error handler
    })

}
module.exports.AdminHesapUpdate = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request().query("update Adminler set kullaniciAd='" + req.body.mynickname + "'  ,Email='" + req.body.Email + "', Sifre='" + req.body.mypassword + "',GuvenlikSorusu='" + req.body.Soru + "', Cevap='" + req.body.myreply + "' where KullaniciAd='" + req.session.nick + "' or KullaniciAd='" + req.body.mynickname2 + "' ", function (err, hesap) {
            if (err) {
                console.log(err);
            }
            pool.request().query("select * from Adminler where KullaniciAd='" + req.body.mynickname + "'", function (err, hesaplar) {
                if (err) {
                    console.log(err);
                }
                pool.request().query("select * from guvenlikSorusu", function (err, soru) {
                    hesaplar.recordset.forEach(function (kullanici) {
                        res.render('adminhesap', { soru: soru.recordset, nickname: kullanici.KullaniciAd, password: kullanici.Sifre, Email: kullanici.Email, reply: kullanici.Cevap, hata: 'Hesabınız başarıyla güncellendi', nick: req.body.ad, question: kullanici.GuvenlikSorusu, Id2: kullanici.Id });
                    });
                    sql.close();
                })
            });
        });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.AdminHesapSilindi = function (req, res) {
    return pool2Connect.then((pool) => {
        pool.request() // or: new sql.Request(pool2)
            .query("delete from Adminler where Id=" + req.params.id + "", function (err, verisonucu) {
                if (err) {
                    console.log(err);
                }
                sql.close();
                res.render('giris', { hata: '' });

            })
    }).catch(err => {
        // ... error handler
    });
}
module.exports.GetAdminSikayetler = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select userId,msg,KullaniciAd,m.odaAdi from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id ", function (err, Liste) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                        .query("select k.Id,nick,mesaj,odaAdi from sikayetMsj s,kullanici k where mesaj like '%%' and k.KullaniciAd=s.nick ", function (err, Liste2) {
                            if (err) {
                                console.log(err);
                            }


                        res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Sikayetler: Liste.recordset,Sikayetler2:Liste2.recordset });
                    });
                });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.AdminSikayetBan = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("insert into BanlananKullanicilar values((select KullaniciAd from kullanici where Id=" + req.body.sikayetNo + "))", function (err, banla) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("delete from kullanici where Id=(select Id from kullanici where Id=" + req.body.sikayetNo + ")", function (err, banla) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("select userId, msg,KullaniciAd,m.odaAdi from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id ", function (err, Liste) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                        .query("select k.Id,nick,mesaj,odaAdi from sikayetMsj s,kullanici k where mesaj like '%%' and k.KullaniciAd=s.nick ", function (err, Liste2) {
                                            if (err) {
                                                console.log(err);
                                            }


                                        res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Sikayetler: Liste.recordset,Sikayetler2:Liste2.recordset });
                                    });
                                });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
/*
module.exports.sil = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("delete from kullanici where Id="+req.params.id+"", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
        });
            res.render('giris',{hata:''});
      sql.close();
    });
}
*/


/*
module.exports.YeniSifre = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("update kullanici set Sifre='" + req.body.password2 + "' where Email='" + req.body.Email + "'  and Cevap='" + req.body.Cevaps + "'", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            res.render('giris',{hata:''});
             sql.close();
        });
    });
}*/