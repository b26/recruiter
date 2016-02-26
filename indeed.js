var utils = require('utils');
var _ = require('underscore');

EASILY = "Easily apply";
URI = "http://www.indeed.com";
var jobs = [];
casper.test.begin('goes to indeed.com', 3, function(test) {
    casper.start(URI, function() {

        /* TODO these should be this.exists */
        test.assertExists('#what');
        this.sendKeys('input#what', 'developer');
        this.sendKeys('input#where', 'Edmonton AB');

        /* Click Search */
        this.click('input#fj');

        /* replace URL. URL will change depending on location */
        URI = this.getCurrentUrl().split('/?')[0];
        this.waitUntilVisible('div.row.result', function () {
            test.pass('Showing jobs');
            var data = this.getElementsInfo('div.row.result');
            _.each(data, function (element, index, list) {
                casper.page.content = list[index]['html'];
                if (casper.exists('span.iaLabel')) {
                        var easily = casper.getElementInfo('span.iaLabel')
                        easily = easily['text'].trim("");
                        if (easily === EASILY) {
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
        });
        test.assertTitleMatch(/Job Search/, 'indeed.com has the right title');
    }).run(function() {
        test.done();
    });
});
