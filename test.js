var SingleBar = require('cli-progress').SingleBar;
var bar = new SingleBar({});
bar.start(500, 0);
bar.update(100);
bar.update(500);
bar.stop();
