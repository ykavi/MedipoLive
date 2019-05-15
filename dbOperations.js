const sql = require('mssql')
var webconfig = {
    user: 'dogukan00',
    password: 'dogukan.12',
    server: 'MpChats.mssql.somee.com',
    database: 'MpChats'
};

module.exports.memberinsert = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("insert into Kullanici(KullaniciAd,Sifre,Email,GuvenlikSorusu,Cevap) values ('" + req.body.KullaniciAd + "','" + req.body.Sifre + "','" + req.body.Eposta + "','" + req.body.Soru + "','" + req.body.Cevap + "')", function (err, recordset) {
            if (err) {
                console.log(err);
            }
            res.render('giris',{hata:''});
            sql.close();
        });
    });
}
module.exports.UyeOl = function (req, res) {
    res.render('UyeOl');
}
module.exports.Giris = function (req, res) {

    res.render('giris',{hata:''});
}
module.exports.GirisYapildi = function (req, res) {
    sql.connect(webconfig, function (err) {
        if (err) console.log(err);
        var request1 = new sql.Request();
        request1.query("Select dbo.fn_UyeVarmi('" + req.body.ad + "','" + req.body.sifre + "') as Sonuc", function (err, verisonucu) {
            if (err) {
                console.log(err);
            }
            debugger
            verisonucu.recordset.forEach(function (kullanici) {
                if (kullanici.Sonuc == "Evet") {
                    res.render('genel', { nick: req.body.ad });
                }
                else {
                    res.render('giris',{hata:'Kullanici Adi veya Şifre Hatalı !'})
                }
            });
            sql.close();
        });
    });
}