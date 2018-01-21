const { exec } = require('child_process');

const {
    configPath = './config.json'
} = require('minimist')(process.argv.slice(2));

const config = require(configPath);

const spawnProcess = async key => {
    const { workingDir, startCommand } = config.processes[key];
    const executeCommand = `cd ${workingDir} && ${startCommand}`;
    console.log(`Spawning process.${key}: ${executeCommand}`);
    return exec(executeCommand);
}

const redirectStd = async (key, process) => {
    const processConfig = config.processes[key];
    processConfig.stdout && process.stdout.on('data', data => console.log(`${key} >> ${data.substring(0, data.length - 1)}`));
    processConfig.stderr && process.stderr.on('data', data => console.error(`${key} >> ${data.substring(0, data.length - 1)}`))
}

async function run(){
    const processes = await Promise.all(Object.keys(config.processes).map(async key => {
        const process = await spawnProcess(key);
        redirectStd(key, process);
        return process;
    }));
}

run()
    .then("finished startup")
    .catch("failed startup");