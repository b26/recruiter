var utils = require('utils');
var _ = require('underscore');
var fb = require('fb.json');

EASILY = "Easily apply";
EASILY2 = "Easily apply to this job";
URI = "http://www.indeed.com";
var jobs = [];

casper.test.begin('goes to indeed.com and signs in', 1, function(test) {
    casper.start(URI, function() {
                if (this.exists('#userOptionsLabel')) {
                    this.click('#userOptionsLabel');
                    this.waitUntilVisible('a.FBConnectButton', function () {
                        this.click('a.FBConnectButton');
                        this.waitForPopup(/facebook/, function () {
                            this.echo(casper.popups.length);
                            test.assertEquals(casper.popups.length, 1);
                            this.withPopup(/facebook/, function () {
                                this.echo(this.getCurrentUrl());
                                /*
                                    id: email, pass, loginbutton
                                */
                                this.waitUntilVisible('#email', function () {
                                    this.sendKeys('input#email', fb.email);
                                    this.sendKeys('input#pass', fb.password);
                                    this.click('#loginbutton');
                                });

                            });
                            /* userOptionsLabel */

                            this.waitUntilVisible('#userOptionsLabel', function () {
                                this.capture('login.png', undefined, {
                                    format: 'png',
                                    quality: 25
                                });
                            })
                            // test.assertEquals(casper.popups.length, 0);
                        });
                    });
                }
    }).run(function() {
        test.done();
    });
});
//
casper.test.begin('goes to indeed.com', 3, function(test) {
    casper.start(URI, function() {

        /* TODO these should be this.exists */
        test.assertExists('#what');
        this.sendKeys('input#what', 'developer');
        this.sendKeys('input#where', 'Edmonton AB');

        //var self = this;

        /* Click Search */
        this.click('input#fj');

        /* replace URL. URL will change depending on location */
        URI = this.getCurrentUrl().split('/?')[0];
        this.waitUntilVisible('div.row.result', function () {
            test.pass('Showing jobs');
            var data = this.getElementsInfo('div.row.result');

            // this.capture('post.png', undefined, {
            //     format: 'png',
            //     quality: 25
            // });

            _.each(data, function (element, index, list) {
                casper.page.content = list[index]['html'];

                var didApply = false;

                var appliedLabel = casper.exists('a.myjobs-serp-link');

                if (appliedLabel) {
                    var applied = casper.getElementInfo('a.myjobs-serp-link');
                    applied = applied['text'].trim("");
                    if (applied === 'Applied') didApply = true;
                }

                var easilyLabel = casper.exists('span.iaLabel');

                if (easilyLabel && !didApply)  {

                        var easily = casper.getElementInfo('span.iaLabel')
                        easily = easily['text'].trim("");

                        /* FIXME not always the case. */

                        if (easily === EASILY || easily === EASILY2) {
                            var obj = casper.getElementInfo('a.turnstileLink');
                            var url = URI + obj['attributes']['href'];
                            var title = obj['attributes']['title'];
                            var company = casper.getElementInfo('span.company');
                            company = company['text'].trim("");
                            /*
                                {
                                    "url":"http://ca.indeed.com/cmp......",
                                    "title":"Delphi Software Developer",
                                    "company":"Metegrity Inc."
                                }
                            */
                            obj = {url: url, title: title, company: company};
                            console.log(JSON.stringify(obj));
                        }

                }
            });

            // this.waitUntilVisible('a.myjobs-serp-link', function () {
            //     // this.capture('results.png', undefined, {
            //     //     format: 'png',
            //     //     quality: 25
            //     // });
            //     var applied = this.getElementInfo('a.myjobs-serp-link')
            //     applied = applied['text'];
            //     //utils.dump();
            //     this.echo(applied);
            // });
            //this.page.content = self.page.content;


        });
        test.assertTitleMatch(/Job Search/, 'indeed.com has the right title');
    }).run(function() {
        test.done();
    });
});
