const {SingleBar} = require('cli-progress')

const bar = new SingleBar({});

bar.start(500, 0);
bar.update(100)
bar.update(500)
bar.stop()
