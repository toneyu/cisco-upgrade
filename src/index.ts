import express from 'express';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const basePath = 'C:\\inetpub\\wwwroot\\IOSServer\\Files\\';

const isCanonicalPath = (path_: string) => path.resolve(path_) === path.normalize(path_)

const app = express();
app.use(fileUpload());
app.use(morgan('combined'));

app.get('/', (req, res) => {
    res.send('An alligator approaches! Hello');
});


app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    await Promise.all(Object.values(req.files).map((file) => {
        return file.mv(path.join(basePath, file.name));
    }));
    res.send('Files uploaded!');
});

app.get('/packages', async (req, res) => {
    const files = await fs.promises.readdir(basePath);
    res.send(files);
});

app.delete('/deletepackage/:file', async (req, res) => {
    if (req.params.file?.trim().length === 0 || !isCanonicalPath(path.join(basePath, req.params.file))) {
        return res.status(400).send('No file was deleted. Please check file name included.');
    }

    const file = req.params.file;

    if (fs.existsSync(path.join(basePath, file))) {
        await fs.promises.unlink(path.join(basePath, file));
        res.send('Deleted ' + file);
    } else {
        res.status(204).send('File does not exist: ' + file);
    }
});

app.listen(3000, () => console.log('Gator app listening on port 3000!'));
