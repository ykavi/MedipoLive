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
            .query(" Select dbo.fn_BanVarmi('" + req.body.ad + "') as Sonuc  ", function (err, ban) {
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
                                    else {
                                        verisonucu.recordset.forEach(function (kullanici) {
                                            admin.recordset.forEach(function (admin) {
                                                if (admin.Sonuc == "Evet") {
                                                    req.session.nick = req.body.ad;
                                                    pool.request()
                                                        .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            pool.request()
                                                            .query("select OdaAdi,COUNT(*) as MesajSayisi from Mesajlar group by OdaAdi", function (err, MesajSayilari) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                           


                                                            req.session.sheld = true;
                                                            res.render('admin', { nick: req.body.ad, kullanici: kullanicilar.recordset,MesajSayilari:MesajSayilari.recordset });
                                                        });
                                                    
                                                
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
                pool.request()
                .query("select OdaAdi,COUNT(*) as MesajSayisi from Mesajlar group by OdaAdi", function (err, MesajSayilari) {
                    if (err) {
                        console.log(err);
                    }
                  


            

                res.render('admin', { nick: req.session.nick, kullanici: kullanicilar.recordset,MesajSayilari:MesajSayilari.recordset });
            });
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

                        pool.request() // or: new sql.Request(pool2)
                            .query("select COUNT(*) as OneriSayisi from Oneriler", function (err, OnerilerSayisi) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("Select dbo.fn_OneriSayisi() as Sonuc", function (err, OneriVarmi) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        OneriVarmi.recordset.forEach(function (sayi) {
                                            if (sayi.Sonuc == "Evet") {
                                                res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, OnerilerSayisi: OnerilerSayisi.recordset });
                                            }
                                            else {

                                                res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Oneri Bulunmamaktadır.', Oneriler: Oneriler.recordset, OnerilerSayisi: OnerilerSayisi.recordset });
                                            }
                                        });
                                    });
                            });
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
                            .query("select COUNT(*) as OneriSayisi from Oneriler", function (err, OnerilerSayisi) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("Select dbo.fn_BanSayisi() as Sonuc", function (err, BanVarmi) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        BanVarmi.recordset.forEach(function (sayi) {
                                            if (sayi.Sonuc == "Evet") {
                                                res.render('AdminOneriGorus', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, no: req.body.no, OnerilerSayisi: OnerilerSayisi.recordset });
                                            }
                                            else {
                                                res.render('AdminOneriGorus', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Öneri Bulunmamaktadır.', Oneriler: Oneriler.recordset, no: req.body.no, OnerilerSayisi: OnerilerSayisi.recordset });
                                            }
                                        });
                                    });
                            });
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
                        pool.request() // or: new sql.Request(pool2)
                            .query("select COUNT(*) as OneriSayisi from Oneriler", function (err, OnerilerSayisi) {
                                if (err) {
                                    console.log(err);
                                }

                                res.render('AdminOneriGorus', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, no: req.body.no, OnerilerSayisi: OnerilerSayisi.recordset });
                            });
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

                                pool.request() // or: new sql.Request(pool2)
                                    .query("select COUNT(*) as OneriSayisi from Oneriler", function (err, OnerilerSayisi) {
                                        if (err) {
                                            console.log(err);
                                        }

                                        pool.request() // or: new sql.Request(pool2)
                                            .query("Select dbo.fn_OneriSayisi() as Sonuc", function (err, OneriVarmi) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                OneriVarmi.recordset.forEach(function (sayi) {
                                                    if (sayi.Sonuc == "Evet") {
                                                        res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Oneriler: Oneriler.recordset, OnerilerSayisi: OnerilerSayisi.recordset });
                                                    }
                                                    else {
                                                        res.render('AdminOneriler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Öneri Bulunmamaktadır.', Oneriler: Oneriler.recordset, OnerilerSayisi: OnerilerSayisi.recordset });
                                                    }
                                                });
                                            });
                                    });
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
module.exports.onlineList = function (nick, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("insert into onlineList VALUES ('" + nick + "',(select COUNT(*) from Mesajlar where userID in (select Id from kullanici where KullaniciAd = '" + nick + "')))", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.onlineListDEL = function (nick, req, res) {
    return pool2Connect.then((pool) => {

        pool.request() // or: new sql.Request(pool2)
            .query("delete onlineList where nick ='" + nick + "' ", function (err, data) {
                if (err) {
                    console.log(err);
                }
            });

    }).catch(err => {
        // ... error handler
    })
}
module.exports.onlineListele = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from onlinelist", function (err, onlinelist) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('onlineList', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', onlinelist: onlinelist.recordset, kod: '' });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.onlineListeleAdmin = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Kullanici where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from onlinelist", function (err, onlinelist) {
                        if (err) {
                            console.log(err);
                        }
                        sql.close();
                        res.render('onlineListAdmin', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', onlinelist: onlinelist.recordset, kod: '' });
                    });
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
                    .query("select s.Id as sikayetId,userId,msg,KullaniciAd,m.odaAdi from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id ", function (err, Liste) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("select k.Id,nick,mesaj,odaAdi from sikayetMsj s,kullanici k where mesaj like '%%' and k.KullaniciAd=s.nick ", function (err, Liste2) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("select COUNT(*) as SikayetSayisi from sikayetMsj ", function (err, SikayetSayisi) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                            .query("Select dbo.fn_SikayetSayisi() as Sonuc", function (err, SikayetVarmi) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                SikayetVarmi.recordset.forEach(function (sayi) {
                                                    if (sayi.Sonuc == "Evet") {

                                                        res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                    }
                                                    else {
                                                        res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Şikayet Bulunmamaktadır.', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                    }
                                                });
                                            });

                                    });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.AdminSikayetSil = function (req, res) {
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
                    .query(" delete from sikayetMsj where Id=" + req.body.sikayetNo2 + "", function (err, SikayetSil) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("select s.Id as sikayetId,userId,msg,KullaniciAd,m.odaAdi from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id ", function (err, Liste) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("select k.Id,nick,mesaj,odaAdi from sikayetMsj s,kullanici k where mesaj like '%%' and k.KullaniciAd=s.nick ", function (err, Liste2) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                            .query("select COUNT(*) as SikayetSayisi from sikayetMsj ", function (err, SikayetSayisi) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                pool.request() // or: new sql.Request(pool2)
                                                    .query("Select dbo.fn_SikayetSayisi() as Sonuc", function (err, SikayetVarmi) {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        SikayetVarmi.recordset.forEach(function (sayi) {
                                                            if (sayi.Sonuc == "Evet") {

                                                                res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                            }
                                                            else {
                                                                res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Şikayet Bulunmamaktadır.', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                            }
                                                        });
                                                    });

                                            });
                                    });
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
                    .query(" delete from sikayetMsj where Id=" + req.body.sikayetNo2 + "", function (err, SikayetSil) {
                        if (err) {
                            console.log(err);
                        }
                      
                        
                          
                        pool.request() // or: new sql.Request(pool2)
                            .query("delete from sikayetMsj where Id in(select s.Id from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id and k.Id=" + req.body.userNo + ")", function (err, banla) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                .query("delete from Mesajlar where userID="+req.body.userNo+"", function (err, MesajlariSil) {
                                    if (err) {
                                        console.log(err);
                                    }

                                pool.request() // or: new sql.Request(pool2)
                                    .query("delete from Oneriler where userID=" + req.body.userNo + "", function (err, OneriSil) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                            .query("insert into BanlananKullanicilar values((select KullaniciAd from kullanici where Id= " + req.body.userNo + " ),(select Sifre from kullanici where Id= " + req.body.userNo + "),(select Email from kullanici where Id= " + req.body.userNo + "),(select GuvenlikSorusu from kullanici where Id= " + req.body.userNo + "),(select Cevap from kullanici where Id= " + req.body.userNo + "))", function (err, banla) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                pool.request() // or: new sql.Request(pool2)
                                                    .query("delete from kullanici where Id=(select Id from kullanici where Id=" + req.body.userNo + ")", function (err, banla) {
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
                                                                        pool.request() // or: new sql.Request(pool2)
                                                                            .query("select COUNT(*) as SikayetSayisi from sikayetMsj ", function (err, SikayetSayisi) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                }
                                                                                pool.request() // or: new sql.Request(pool2)
                                                                                    .query("Select dbo.fn_SikayetSayisi() as Sonuc", function (err, SikayetVarmi) {
                                                                                        if (err) {
                                                                                            console.log(err);
                                                                                        }
                                                                                        SikayetVarmi.recordset.forEach(function (sayi) {
                                                                                            if (sayi.Sonuc == "Evet") {

                                                                                                res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: '', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                                                            }
                                                                                            else {
                                                                                                res.render('AdminSikayetler', { nick: req.session.nick, kullanici: kullanicilar.recordset, hata: 'Şikayet Bulunmamaktadır.', Sikayetler: Liste.recordset, Sikayetler2: Liste2.recordset, SikayetSayisi: SikayetSayisi.recordset });
                                                                                            }
                                                                                        });
                                                                                    });
                                                                            });
                                                                              });
                                                                            });
                                                                   
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.GetUyeListele = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select COUNT(*) as KullaniciSayisi from kullanici", function (err, KullaniciSayisi) {
                        if (err) {
                            console.log(err);
                        }
                        

                        pool.request() // or: new sql.Request(pool2)
                            .query("select * from kullanici", function (err, kullanicilar) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                .query("Select dbo.fn_UyeSayisi() as Sonuc", function (err, KullaniciVarmi) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    KullaniciVarmi.recordset.forEach(function (sayi) {
                                        if (sayi.Sonuc == "Evet") {

                                res.render('AdminUyeList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset,Kullanici:KullaniciSayisi.recordset });
                                   
                            
                            }
                            else{
                                res.render('AdminUyeList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: 'Üye Bulunmamaktadır.', kullanicilar: kullanicilar.recordset,Kullanici:KullaniciSayisi.recordset });
                                   
                            }
                            });
                            });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.PostUyeListele = function (req, res) {

    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici where Id=" + req.body.no + "", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)


                        pool.request() // or: new sql.Request(pool2)
                            .query("select * from guvenlikSorusu", function (err, soru) {

                                res.render('AdminKullaniciBilgileri', { nick: req.session.nick, soru: soru.recordset, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset, no: req.body.no });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.GetAdminKullaniciBilgileri = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("select * from kullanici", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("select * from guvenlikSorusu", function (err, soru) {

                                res.render('AdminKullaniciBilgileri', { nick: req.session.nick, soru: soru.recordset, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset, no: req.body.no });
                            });

                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.AdminUyeBan = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        req.session.no = req.body.no
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }
                pool.request() // or: new sql.Request(pool2)
                    .query("delete from Oneriler where userID=" + req.body.BanNo + "", function (err, OnerileriSil) {
                        if (err) {
                            console.log(err);
                        }
                       
                      
                        pool.request() // or: new sql.Request(pool2)
                            .query("delete from sikayetMsj where Id in(select s.Id from sikayetMsj s,Mesajlar m,kullanici k where s.mesajId=m.Id and m.userId=k.Id and k.Id=" + req.body.BanNo + ")", function (err, banla) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                .query("delete from Mesajlar where userID="+req.body.BanNo+"", function (err, MesajlariSil) {
                                    if (err) {
                                        console.log(err);
                                    }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("insert into BanlananKullanicilar values((select KullaniciAd from kullanici where Id= " + req.body.BanNo + " ),(select Sifre from kullanici where Id= " + req.body.BanNo + "),(select Email from kullanici where Id= " + req.body.BanNo + "),(select GuvenlikSorusu from kullanici where Id= " + req.body.BanNo + "),(select Cevap from kullanici where Id= " + req.body.BanNo + ")) ", function (err, banla) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                            .query("delete from kullanici where Id=(select Id from kullanici where Id=" + req.body.BanNo + ")", function (err, banla) {
                                                if (err) {
                                                    console.log(err);
                                                }




                                                pool.request() // or: new sql.Request(pool2)
                                                    .query("select * from kullanici", function (err, kullanicilar) {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        pool.request() // or: new sql.Request(pool2)
                                                        .query("select COUNT(*) as KullaniciSayisi from kullanici", function (err, KullaniciSayisi) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            pool.request() // or: new sql.Request(pool2)
                                                            .query("Select dbo.fn_UyeSayisi() as Sonuc", function (err, KullaniciVarmi) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                                KullaniciVarmi.recordset.forEach(function (sayi) {
                                                                    if (sayi.Sonuc == "Evet") {
                                                        res.render('AdminUyeList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset,Kullanici:KullaniciSayisi.recordset });
                                                                    }
                                                                    else{
                                                                        res.render('AdminUyeList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: 'Üye Bulunmamaktadır.', kullanicilar: kullanicilar.recordset,Kullanici:KullaniciSayisi.recordset });
                                                                 
                                                                    }

                                                    });
                                                    
                                                });
                                                });
                                                });
                                            });
                                            });
                                    });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.GetBanListele = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }

                pool.request() // or: new sql.Request(pool2)
                    .query("select * from BanlananKullanicilar", function (err, kullanicilar) {
                        if (err) {
                            console.log(err);
                        }
                        pool.request() // or: new sql.Request(pool2)
                            .query("select * from guvenlikSorusu", function (err, soru) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("select COUNT(*)  as BanlananSayisi from BanlananKullanicilar", function (err, BanlananSayisi) {
                                        if (err) {
                                            console.log(err);
                                        }

                                        pool.request() // or: new sql.Request(pool2)
                                            .query("Select dbo.fn_BanSayisi() as Sonuc", function (err, BanVarmi) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                BanVarmi.recordset.forEach(function (sayi) {
                                                    if (sayi.Sonuc == "Evet") {
                                                        res.render('AdminBanList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset, soru: soru.recordset, BanSayisi: BanlananSayisi.recordset });
                                                    }

                                                    else {

                                                        res.render('AdminBanList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: 'Banlanan kullanıcı bulunmamaktadır.', kullanicilar: kullanicilar.recordset, soru: soru.recordset, BanSayisi: BanlananSayisi.recordset });
                                                    }
                                                });
                                            });
                                    });
                            });

                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.PostBanListele = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    return pool2Connect.then((pool) => {
        // or: new sql.Request(pool2)
        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, Adminkullanicilar) {
                if (err) {
                    console.log(err);
                }

                pool.request() // or: new sql.Request(pool2)
                    .query("   insert into kullanici values('" + req.body.kullaniciAd + "','" + req.body.Sifre + "','" + req.body.Email + "','" + req.body.soru + "','" + req.body.Cevap + "') ", function (err, banKaldir) {
                        if (err) {
                            console.log(err);
                        }



                        pool.request() // or: new sql.Request(pool2)
                            .query("delete  from BanlananKullanicilar where Id=" + req.body.BanNo + "", function (err, Ban) {
                                if (err) {
                                    console.log(err);
                                }
                                pool.request() // or: new sql.Request(pool2)
                                    .query("select * from BanlananKullanicilar", function (err, kullanicilar) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        pool.request() // or: new sql.Request(pool2)
                                            .query("select * from guvenlikSorusu", function (err, soru) {

                                                pool.request() // or: new sql.Request(pool2)
                                                    .query("select COUNT(*)  as BanlananSayisi from BanlananKullanicilar", function (err, BanlananSayisi) {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        pool.request() // or: new sql.Request(pool2)
                                                            .query("Select dbo.fn_BanSayisi() as Sonuc", function (err, BanVarmi) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                                BanVarmi.recordset.forEach(function (sayi) {
                                                                    if (sayi.Sonuc == "Evet") {
                                                                        res.render('AdminBanList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: '', kullanicilar: kullanicilar.recordset, soru: soru.recordset, BanSayisi: BanlananSayisi.recordset });
                                                                    }

                                                                    else {

                                                                        res.render('AdminBanList', { nick: req.session.nick, Adminkullanici: Adminkullanicilar.recordset, hata: 'Banlanan kullanıcı bulunmamaktadır.', kullanicilar: kullanicilar.recordset, soru: soru.recordset, BanSayisi: BanlananSayisi.recordset });
                                                                    }
                                                                });
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    }).catch(err => {
        // ... error handler
    })
}
module.exports.PostAdminMesajlariSil = function (req, res) {
    if (req.session.sheld == null) {
        res.render('giris', { hata: 'Lütfen Önce Giriş Yapınız..' });
    }
    req.session.odaAdi=req.body.odaAdi
    return pool2Connect.then((pool) => {


        pool.request() // or: new sql.Request(pool2)
            .query("select * from Adminler where KullaniciAd='" + req.session.nick + "'", function (err, kullanicilar) {
                if (err) {
                    console.log(err);
                }
           
              

                pool.request()
                .query("delete from Mesajlar where OdaAdi='"+req.body.odaAdi+"'", function (err, MesajSayilariSil) {
                    if (err) {
                        console.log(err);
                    }
                pool.request()
                .query("select OdaAdi,COUNT(*) as MesajSayisi from Mesajlar group by OdaAdi", function (err, MesajSayilari) {
                    if (err) {
                        console.log(err);
                    }
                 

                            res.render('admin', { nick: req.session.nick, kullanici: kullanicilar.recordset,MesajSayilari:MesajSayilari.recordset});
                        
        

              
          
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