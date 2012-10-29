var System;
(function (System) {
    var Environment = (function () {
        function Environment() { }
        Environment.isNode = function isNode() {
            return !(typeof ActiveXObject === "function");
        }
        Environment.isWsh = function isWsh() {
            return !Environment.isNode();
        }
        return Environment;
    })();
    System.Environment = Environment;    
})(System || (System = {}));

var System;
(function (System) {
    
})(System || (System = {}));

var System;
(function (System) {
    (function (IO) {
        var StreamWriter = (function () {
            function StreamWriter() {
                this.autoFlush = true;
            }
            StreamWriter.prototype.flush = function () {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.flushAsync = function (callback) {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.write = function (value) {
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flush();
                    this._buffer = null;
                }
            };
            StreamWriter.prototype.writeLine = function (value) {
                this.write(value + '\n');
            };
            StreamWriter.prototype.writeAsync = function (value, callback) {
                var _this = this;
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flushAsync(function () {
                        _this._buffer = null;
                        callback();
                    });
                }
            };
            StreamWriter.prototype.writeLineAsync = function (value, callback) {
                this.writeAsync(value + '\n', callback);
            };
            StreamWriter.prototype.dispose = function () {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.close = function () {
                throw new Error("Not Implemented Exception");
            };
            return StreamWriter;
        })();
        IO.StreamWriter = StreamWriter;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;

})(System || (System = {}));

var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var NodeJs;
(function (NodeJs) {
    var ConsoleWriter = (function (_super) {
        __extends(ConsoleWriter, _super);
        function ConsoleWriter() {
            _super.apply(this, arguments);

        }
        ConsoleWriter.prototype.flush = function () {
            process.stdout.write(this._buffer);
        };
        ConsoleWriter.prototype.flushAsync = function (callback) {
            this.flush();
            callback();
        };
        ConsoleWriter.prototype.dispose = function () {
            throw new Error("Not Implemented Exception");
        };
        return ConsoleWriter;
    })(System.IO.StreamWriter);
    NodeJs.ConsoleWriter = ConsoleWriter;    
})(NodeJs || (NodeJs = {}));

var Wsh;
(function (Wsh) {
    var ConsoleWriter = (function (_super) {
        __extends(ConsoleWriter, _super);
        function ConsoleWriter() {
            _super.apply(this, arguments);

        }
        ConsoleWriter.prototype.flush = function () {
            WScript.StdOut.Write(this._buffer);
        };
        ConsoleWriter.prototype.flushAsync = function (callback) {
            this.flush();
            callback();
        };
        ConsoleWriter.prototype.dispose = function () {
            throw new Error("Not Implemented Exception");
        };
        return ConsoleWriter;
    })(System.IO.StreamWriter);
    Wsh.ConsoleWriter = ConsoleWriter;    
})(Wsh || (Wsh = {}));

var System;
(function (System) {
    var Console = (function () {
        function Console() { }
        Console.out = null;
        Console.initialize = function initialize() {
            if(System.Environment.isNode()) {
                Console.out = new NodeJs.ConsoleWriter();
            } else {
                if(System.Environment.isWsh()) {
                    Console.out = new Wsh.ConsoleWriter();
                } else {
                    throw new Error('Invalid host');
                }
            }
        }
        Console.write = function write(value) {
            Console.out.write(value);
        }
        Console.writeLine = function writeLine(value) {
            Console.out.writeLine(value);
        }
        Console.writeAsync = function writeAsync(value, callback) {
            Console.out.writeAsync(value, callback);
        }
        Console.writeLineAsync = function writeLineAsync(value, callback) {
            Console.out.writeLineAsync(value, callback);
        }
        return Console;
    })();
    System.Console = Console;    
})(System || (System = {}));

var System;
(function (System) {
    
})(System || (System = {}));

var NodeJs;
(function (NodeJs) {
    var FileStreamWriter = (function (_super) {
        __extends(FileStreamWriter, _super);
        function FileStreamWriter(path) {
                _super.call(this);
            this.path = path;
            this._fs = require('fs');
            this.autoFlush = false;
        }
        FileStreamWriter.prototype.flush = function () {
            this._fs.appendFileSync(this.path, this._buffer);
        };
        FileStreamWriter.prototype.flushAsync = function (callback) {
            this._fs.writeFile(this.path, this._buffer, function (err) {
                if(err) {
                    throw err;
                }
                callback();
            });
        };
        FileStreamWriter.prototype.close = function () {
        };
        return FileStreamWriter;
    })(System.IO.StreamWriter);    
    var FileHandle = (function () {
        function FileHandle() {
            this._fs = require('fs');
        }
        FileHandle.prototype.readFile = function (file) {
            var buffer = this._fs.readFileSync(file);
            switch(buffer[0]) {
                case 254: {
                    if(buffer[1] == 255) {
                        var i = 0;
                        while((i + 1) < buffer.length) {
                            var temp = buffer[i];
                            buffer[i] = buffer[i + 1];
                            buffer[i + 1] = temp;
                            i += 2;
                        }
                        return buffer.toString("ucs2", 2);
                    }
                    break;

                }
                case 255: {
                    if(buffer[1] == 254) {
                        return buffer.toString("ucs2", 2);
                    }
                    break;

                }
                case 239: {
                    if(buffer[1] == 187) {
                        return buffer.toString("utf8", 3);
                    }

                }
            }
            return buffer.toString();
        };
        FileHandle.prototype.createFile = function (path) {
            this._fs.writeFileSync(path, '');
            return new FileStreamWriter(path);
        };
        FileHandle.prototype.deleteFile = function (path) {
            try  {
                this._fs.unlinkSync(path);
            } catch (e) {
            }
        };
        FileHandle.prototype.fileExists = function (path) {
            return this._fs.existsSync(path);
        };
        return FileHandle;
    })();
    NodeJs.FileHandle = FileHandle;    
})(NodeJs || (NodeJs = {}));

var Wsh;
(function (Wsh) {
    var FileStreamWriter = (function (_super) {
        __extends(FileStreamWriter, _super);
        function FileStreamWriter(streamObj, path, streamObjectPool) {
                _super.call(this);
            this.streamObj = streamObj;
            this.path = path;
            this.autoFlush = false;
            this._streamObjectPool = streamObjectPool;
        }
        FileStreamWriter.prototype.releaseStreamObject = function (obj) {
            this._streamObjectPool.push(obj);
        };
        FileStreamWriter.prototype.flush = function () {
            this.streamObj.WriteText(this._buffer, 0);
        };
        FileStreamWriter.prototype.flushAsync = function (callback) {
            this.streamObj.WriteText(this._buffer, 0);
            callback();
        };
        FileStreamWriter.prototype.close = function () {
            this.streamObj.SaveToFile(this.path, 2);
            this.streamObj.Close();
            this.releaseStreamObject(this.streamObj);
        };
        return FileStreamWriter;
    })(System.IO.StreamWriter);    
    var FileHandle = (function () {
        function FileHandle() {
            this._fso = new ActiveXObject("Scripting.FileSystemObject");
            this._streamObjectPool = [];
        }
        FileHandle.prototype.getStreamObject = function () {
            if(this._streamObjectPool.length > 0) {
                return this._streamObjectPool.pop();
            } else {
                return new ActiveXObject("ADODB.Stream");
            }
        };
        FileHandle.prototype.releaseStreamObject = function (obj) {
            this._streamObjectPool.push(obj);
        };
        FileHandle.prototype.readFile = function (file) {
            try  {
                var streamObj = this.getStreamObject();
                streamObj.Open();
                streamObj.Type = 2;
                streamObj.Charset = 'x-ansi';
                streamObj.LoadFromFile(file);
                var bomChar = streamObj.ReadText(2);
                streamObj.Position = 0;
                if((bomChar.charCodeAt(0) == 254 && bomChar.charCodeAt(1) == 255) || (bomChar.charCodeAt(0) == 255 && bomChar.charCodeAt(1) == 254)) {
                    streamObj.Charset = 'unicode';
                } else {
                    if(bomChar.charCodeAt(0) == 239 && bomChar.charCodeAt(1) == 187) {
                        streamObj.Charset = 'utf-8';
                    }
                }
                var str = streamObj.ReadText(-1);
                streamObj.Close();
                this.releaseStreamObject(streamObj);
                return str;
            } catch (err) {
                throw new Error("Error reading file \"" + file + "\": " + err.message);
            }
        };
        FileHandle.prototype.createFile = function (path, useUTF8) {
            try  {
                var streamObj = this.getStreamObject();
                streamObj.Charset = useUTF8 ? 'utf-8' : 'x-ansi';
                streamObj.Open();
                return new FileStreamWriter(streamObj, path, this._streamObjectPool);
            } catch (ex) {
                WScript.StdErr.WriteLine("Couldn't write to file '" + path + "'");
                throw ex;
            }
        };
        FileHandle.prototype.deleteFile = function (path) {
            if(this._fso.FileExists(path)) {
                this._fso.DeleteFile(path, true);
            }
        };
        FileHandle.prototype.fileExists = function (path) {
            return this._fso.FileExists(path);
        };
        return FileHandle;
    })();
    Wsh.FileHandle = FileHandle;    
})(Wsh || (Wsh = {}));

var System;
(function (System) {
    (function (IO) {
        var FileManager = (function () {
            function FileManager() { }
            FileManager.handle = null;
            FileManager.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    FileManager.handle = new NodeJs.FileHandle();
                } else {
                    if(System.Environment.isWsh()) {
                        FileManager.handle = new Wsh.FileHandle();
                    } else {
                        throw new Error('Invalid host');
                    }
                }
            }
            return FileManager;
        })();
        IO.FileManager = FileManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;

})(System || (System = {}));

var System;
(function (System) {
    
})(System || (System = {}));

var NodeJs;
(function (NodeJs) {
    var WebRequest = (function () {
        function WebRequest() {
            this._request = require('request');
        }
        WebRequest.prototype.getUrl = function (url, callback) {
            System.Console.writeLine("tsd \033[32mhttp \033[35mGET\033[0m " + url);
            this._request(url, function (error, response, body) {
                System.Console.writeLine("tsd \033[32mhttp \033[35m" + response.statusCode + "\033[0m " + url);
                if(!error && response.statusCode == 200) {
                    callback(body);
                } else {
                    System.Console.writeLine("tsd \033[31ERR!\033[0m " + response.statusCode + " " + error);
                }
            });
        };
        return WebRequest;
    })();
    NodeJs.WebRequest = WebRequest;    
})(NodeJs || (NodeJs = {}));

var Wsh;
(function (Wsh) {
    var WebRequest = (function () {
        function WebRequest() { }
        WebRequest.prototype.request = function (url, callback) {
            var strResult;
            System.Console.writeLine("tsd http GET " + url);
            var WinHttpReq = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
            try  {
                var temp = WinHttpReq.Open("GET", url, false);
                WinHttpReq.Send();
                System.Console.writeLine("tsd http " + WinHttpReq.statusCode + " " + url);
                strResult = WinHttpReq.ResponseText;
            } catch (objError) {
                System.Console.writeLine("tsd ERR! " + WinHttpReq.statusCode + " " + objError.message);
                strResult = objError + "\n";
                strResult += "WinHTTP returned error: " + (objError.number & 65535).toString() + "\n\n";
                strResult += objError.description;
            }
            return callback(strResult);
        };
        WebRequest.prototype.getUrl = function (url, callback) {
            this.request(url, callback);
        };
        return WebRequest;
    })();
    Wsh.WebRequest = WebRequest;    
})(Wsh || (Wsh = {}));

var System;
(function (System) {
    (function (Web) {
        var WebHandler = (function () {
            function WebHandler() { }
            WebHandler.request = null;
            WebHandler.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    WebHandler.request = new NodeJs.WebRequest();
                } else {
                    if(System.Environment.isWsh()) {
                        WebHandler.request = new Wsh.WebRequest();
                    } else {
                        throw new Error('Invalid host');
                    }
                }
            }
            return WebHandler;
        })();
        Web.WebHandler = WebHandler;        
    })(System.Web || (System.Web = {}));
    var Web = System.Web;

})(System || (System = {}));

var RepositoryTypeEnum;
(function (RepositoryTypeEnum) {
    RepositoryTypeEnum._map = [];
    RepositoryTypeEnum._map[0] = "FileSystem";
    RepositoryTypeEnum.FileSystem = 0;
    RepositoryTypeEnum._map[1] = "Web";
    RepositoryTypeEnum.Web = 1;
})(RepositoryTypeEnum || (RepositoryTypeEnum = {}));

var Config = (function () {
    function Config() { }
    Config.prototype.load = function (cfgFile) {
    };
    return Config;
})();
var DataSource;
(function (DataSource) {
    var WebDataSource = (function () {
        function WebDataSource(repositoryUrl) {
            this.repositoryUrl = repositoryUrl;
        }
        WebDataSource.prototype.all = function (callback) {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, function (body) {
                if(System.Environment.isWsh()) {
                    callback(eval("(function(){return " + body + ";})()"));
                } else {
                    callback(JSON.parse(body));
                }
            });
        };
        WebDataSource.prototype.find = function (keys) {
            return null;
        };
        return WebDataSource;
    })();
    DataSource.WebDataSource = WebDataSource;    
})(DataSource || (DataSource = {}));

var DataSource;
(function (DataSource) {
    var FileSystemDataSource = (function () {
        function FileSystemDataSource(repositoryPath) {
            this.repositoryPath = repositoryPath;
            this._fs = require('fs');
        }
        FileSystemDataSource.prototype.all = function (callback) {
            this._fs.readFile(this.repositoryPath, function (err, data) {
                if(err) {
                    throw err;
                }
                callback(JSON.parse(data));
            });
        };
        FileSystemDataSource.prototype.find = function (keys) {
            return null;
        };
        return FileSystemDataSource;
    })();
    DataSource.FileSystemDataSource = FileSystemDataSource;    
})(DataSource || (DataSource = {}));

var DataSource;
(function (DataSource) {
    var LibVersion = (function () {
        function LibVersion() {
            this.dependencies = [];
        }
        return LibVersion;
    })();
    DataSource.LibVersion = LibVersion;    
    var Lib = (function () {
        function Lib() {
            this.versions = new Array();
        }
        return Lib;
    })();
    DataSource.Lib = Lib;    
    var LibContent = (function () {
        function LibContent() { }
        return LibContent;
    })();
    DataSource.LibContent = LibContent;    
})(DataSource || (DataSource = {}));

var Command;
(function (Command) {
    var HelpCommand = (function () {
        function HelpCommand() {
            this.shortcut = "-h";
            this.usage = "Print this help message";
        }
        HelpCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        HelpCommand.prototype.exec = function (args) {
        };
        HelpCommand.prototype.toString = function () {
            return this.shortcut + "        " + this.usage;
        };
        return HelpCommand;
    })();
    Command.HelpCommand = HelpCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var AllCommand = (function () {
        function AllCommand(dataSource) {
            this.dataSource = dataSource;
            this.shortcut = "all";
            this.usage = "Show all file definitions from repository";
        }
        AllCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        AllCommand.prototype.print = function (lib) {
            System.Console.write(' ' + (System.Environment.isNode() ? '\033[36m' : '') + lib.name + (System.Environment.isNode() ? '\033[0m' : '') + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.write(']');
            System.Console.writeLine(' - ' + lib.description);
        };
        AllCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    _this.print(lib);
                }
            });
        };
        AllCommand.prototype.toString = function () {
            return this.shortcut + "       " + this.usage;
        };
        return AllCommand;
    })();
    Command.AllCommand = AllCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var SearchCommand = (function () {
        function SearchCommand(dataSource) {
            this.dataSource = dataSource;
            this.shortcut = "search";
            this.usage = "Search a file definition on repository";
        }
        SearchCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        SearchCommand.prototype.print = function (lib) {
            System.Console.write(' ' + (System.Environment.isNode() ? '\033[36m' : '') + lib.name + (System.Environment.isNode() ? '\033[0m' : '') + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(", ");
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.write("]");
            System.Console.writeLine(" - " + lib.description);
        };
        SearchCommand.prototype.match = function (key, name) {
            return name.indexOf(key) != -1;
        };
        SearchCommand.prototype.printIfMatch = function (lib, args) {
            var found = false;
            for(var i = 3; i < args.length; i++) {
                var key = args[i];
                if(this.match(key, lib.name)) {
                    this.print(lib);
                    found = true;
                }
            }
            return found;
        };
        SearchCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                var found = false;
                System.Console.writeLine("Search results:");
                System.Console.writeLine("");
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    if(_this.printIfMatch(lib, args)) {
                        found = true;
                    }
                }
                if(!found) {
                    System.Console.writeLine("No results found.");
                }
            });
        };
        SearchCommand.prototype.toString = function () {
            return this.shortcut + "    " + this.usage;
        };
        return SearchCommand;
    })();
    Command.SearchCommand = SearchCommand;    
})(Command || (Command = {}));

var System;
(function (System) {
    
})(System || (System = {}));

var NodeJs;
(function (NodeJs) {
    var DirectoryHandle = (function () {
        function DirectoryHandle() {
            this._fs = require('fs');
            this._path = require('path');
        }
        DirectoryHandle.prototype.directoryExists = function (path) {
            return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
        };
        DirectoryHandle.prototype.createDirectory = function (path) {
            if(!this.directoryExists(path)) {
                this._fs.mkdirSync(path);
            }
        };
        DirectoryHandle.prototype.dirName = function (path) {
            return this._path.dirname(path);
        };
        DirectoryHandle.prototype.getAllFiles = function (path, spec, options) {
            var _this = this;
            options = options || {
            };
            var filesInFolder = function (folder) {
                var paths = [];
                var files = _this._fs.readdirSync(folder);
                for(var i = 0; i < files.length; i++) {
                    var stat = _this._fs.statSync(folder + "\\" + files[i]);
                    if(options.recursive && stat.isDirectory()) {
                        paths = paths.concat(filesInFolder(folder + "\\" + files[i]));
                    } else {
                        if(stat.isFile() && (!spec || files[i].match(spec))) {
                            paths.push(folder + "\\" + files[i]);
                        }
                    }
                }
                return paths;
            };
            return filesInFolder(path);
        };
        return DirectoryHandle;
    })();
    NodeJs.DirectoryHandle = DirectoryHandle;    
})(NodeJs || (NodeJs = {}));

var Wsh;
(function (Wsh) {
    
    var DirectoryHandle = (function () {
        function DirectoryHandle() {
            this._fso = new ActiveXObject("Scripting.FileSystemObject");
        }
        DirectoryHandle.prototype.directoryExists = function (path) {
            return this._fso.FolderExists(path);
        };
        DirectoryHandle.prototype.createDirectory = function (path) {
            if(!this.directoryExists(path)) {
                this._fso.CreateFolder(path);
            }
        };
        DirectoryHandle.prototype.dirName = function (path) {
            return this._fso.GetParentFolderName(path);
        };
        DirectoryHandle.prototype.getAllFiles = function (path, spec, options) {
            options = options || {
            };
            function filesInFolder(folder, root) {
                var paths = [];
                var fc;
                if(options.recursive) {
                    fc = new Enumerator(folder.subfolders);
                    for(; !fc.atEnd(); fc.moveNext()) {
                        paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                    }
                }
                fc = new Enumerator(folder.files);
                for(; !fc.atEnd(); fc.moveNext()) {
                    if(!spec || fc.item().Name.match(spec)) {
                        paths.push(root + "\\" + fc.item().Name);
                    }
                }
                return paths;
            }
            var folder = this._fso.GetFolder(path);
            var paths = [];
            return filesInFolder(folder, path);
        };
        return DirectoryHandle;
    })();
    Wsh.DirectoryHandle = DirectoryHandle;    
})(Wsh || (Wsh = {}));

var System;
(function (System) {
    (function (IO) {
        var DirectoryManager = (function () {
            function DirectoryManager() { }
            DirectoryManager.handle = null;
            DirectoryManager.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    DirectoryManager.handle = new NodeJs.DirectoryHandle();
                } else {
                    if(System.Environment.isWsh()) {
                        DirectoryManager.handle = new Wsh.DirectoryHandle();
                    } else {
                        throw new Error('Invalid host');
                    }
                }
            }
            return DirectoryManager;
        })();
        IO.DirectoryManager = DirectoryManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;

})(System || (System = {}));

var Command;
(function (Command) {
    var InstallCommand = (function () {
        function InstallCommand(dataSource, cfg) {
            this.dataSource = dataSource;
            this.cfg = cfg;
            this.shortcut = "install";
            this.usage = "Intall file definition";
            this._cache = [];
            this._index = 0;
        }
        InstallCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        InstallCommand.prototype.print = function (lib) {
            System.Console.write(lib.name + ' - ' + lib.description + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.writeLine(']');
        };
        InstallCommand.prototype.match = function (key, name) {
            return name.toUpperCase() == key.toUpperCase();
        };
        InstallCommand.prototype.saveFile = function (name, content) {
            var sw = System.IO.FileManager.handle.createFile(name);
            sw.write(content);
            sw.flush();
            sw.close();
        };
        InstallCommand.prototype.save = function (name, version, key, content) {
            if(!System.IO.DirectoryManager.handle.directoryExists(this.cfg.localPath)) {
                System.IO.DirectoryManager.handle.createDirectory(this.cfg.localPath);
            }
            var fileNameWithoutExtension = this.cfg.localPath + "\\" + name + "-" + version;
            this.saveFile(fileNameWithoutExtension + ".d.ts", content);
            System.Console.writeLine("└── " + name + "@" + version + " instaled.");
            this.saveFile(fileNameWithoutExtension + ".d.key", key);
            System.Console.writeLine("     └── " + key + ".key");
        };
        InstallCommand.prototype.find = function (key, libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(this.match(lib.name, key)) {
                    return lib;
                }
            }
            return null;
        };
        InstallCommand.prototype.cacheContains = function (name) {
            for(var i = 0; i < this._cache.length; i++) {
                if(this._cache[i] == name) {
                    return true;
                }
            }
            return false;
        };
        InstallCommand.prototype.install = function (targetLib, targetVersion, libs) {
            var _this = this;
            if(this.cacheContains(targetLib.name + '@' + targetVersion)) {
                return;
            }
            if(targetLib == null) {
                System.Console.writeLine("Lib not found.");
            } else {
                var version = targetLib.versions[0];
                System.Web.WebHandler.request.getUrl(version.url, function (body) {
                    _this.save(targetLib.name, version.version, version.key, body);
                    _this._cache.push(targetLib.name + '@' + version.version);
                    var deps = (targetLib.versions[0].dependencies) || [];
                    for(var i = 0; i < deps.length; i++) {
                        var dep = _this.find(deps[i].name, libs);
                        _this.install(dep, dep.versions[0].version, libs);
                    }
                });
            }
        };
        InstallCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                System.Console.writeLine("");
                var targetLib = _this.find(args[3], libs);
                if(targetLib) {
                    _this.install(targetLib, targetLib.versions[0].version, libs);
                } else {
                    System.Console.writeLine("Lib not found.");
                }
            });
        };
        InstallCommand.prototype.toString = function () {
            return this.shortcut + "   " + this.usage;
        };
        return InstallCommand;
    })();
    Command.InstallCommand = InstallCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var Lib = (function () {
        function Lib() { }
        return Lib;
    })();    
    var UpdateCommand = (function () {
        function UpdateCommand(dataSource, cfg) {
            this.dataSource = dataSource;
            this.cfg = cfg;
            this.shortcut = "update";
            this.usage = "Checks if any definition file needs to be updated";
        }
        UpdateCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        UpdateCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                var libList = [];
                var files = System.IO.DirectoryManager.handle.getAllFiles(_this.cfg.localPath);
                for(var i = 0; i < files.length; i++) {
                    var file = files[i].substr(_this.cfg.localPath.length + 1);
                    if(file.substr(file.length - 5) == 'd.key') {
                        var name = file.substr(0, file.lastIndexOf('-'));
                        var version = file.substr(name.length + 1, file.length - name.length - 7);
                        var key = System.IO.FileManager.handle.readFile(files[i]);
                        var flg = false;
                        for(var j = 0; j < libs.length; j++) {
                            var lib = libs[j];
                            if(name == lib.name) {
                                if(version == lib.versions[0].version) {
                                    if(key != lib.versions[0].key) {
                                        System.Console.writeLine(' ' + (System.Environment.isNode() ? '\033[36m' : '') + name + (System.Environment.isNode() ? '\033[0m' : '') + ' - ' + (System.Environment.isNode() ? '\033[33m' : '') + 'A new version is available!' + (System.Environment.isNode() ? '\033[0m' : ''));
                                        flg = true;
                                    }
                                }
                            }
                        }
                        if(!flg) {
                            System.Console.writeLine(' ' + (System.Environment.isNode() ? '\033[36m' : '') + name + (System.Environment.isNode() ? '\033[0m' : '') + ' - ' + 'Is the latest version.');
                        }
                    }
                }
            });
        };
        UpdateCommand.prototype.toString = function () {
            return this.shortcut + "    " + this.usage;
        };
        return UpdateCommand;
    })();
    Command.UpdateCommand = UpdateCommand;    
})(Command || (Command = {}));

var CommandLineProcessor = (function () {
    function CommandLineProcessor(dataSource, cfg) {
        this.dataSource = dataSource;
        this.cfg = cfg;
        this.commands = [];
        this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(this.dataSource));
        this.commands.push(new Command.SearchCommand(this.dataSource));
        this.commands.push(new Command.InstallCommand(this.dataSource, this.cfg));
        this.commands.push(new Command.UpdateCommand(this.dataSource, this.cfg));
    }
    CommandLineProcessor.prototype.printUsage = function () {
        System.Console.out.autoFlush = false;
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('   Ex.: tsd search nodejs');
        System.Console.writeLine('');
        System.Console.writeLine('Options:');
        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine("  " + this.commands[i].toString());
        }
        System.Console.out.flush();
    };
    CommandLineProcessor.prototype.execute = function (args) {
        System.Console.writeLine("Command: " + (args[2] || "..."));
        System.Console.writeLine('');
        var accepted = false;
        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof Command.HelpCommand) {
                    this.printUsage();
                } else {
                    command.exec(args);
                }
            }
        }
        if(!accepted) {
            this.printUsage();
        }
    };
    return CommandLineProcessor;
})();
var DataSource;
(function (DataSource) {
    var DataSourceFactory = (function () {
        function DataSourceFactory() { }
        DataSourceFactory.factory = function factory(cfg) {
            if(cfg.repositoryType == RepositoryTypeEnum.FileSystem) {
                return new DataSource.FileSystemDataSource(cfg.uri);
            } else {
                if(cfg.repositoryType == RepositoryTypeEnum.Web) {
                    return new DataSource.WebDataSource(cfg.uri);
                } else {
                    throw Error('Invalid dataSource.');
                }
            }
        }
        return DataSourceFactory;
    })();
    DataSource.DataSourceFactory = DataSourceFactory;    
})(DataSource || (DataSource = {}));

var VERSION = "0.2.1";
var Main = (function () {
    function Main() { }
    Main.prototype.init = function () {
        System.Console.initialize();
        System.IO.FileManager.initialize();
        System.IO.DirectoryManager.initialize();
        System.Web.WebHandler.initialize();
    };
    Main.prototype.run = function (args) {
        try  {
            var cfg = new Config();
            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";
            cfg.localPath = "d.ts";
            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(ds, cfg);
            cp.execute(args);
        } catch (e) {
            System.Console.writeLine(e.message);
        }
    };
    return Main;
})();
var main = new Main();
main.init();
var arguments;
if(System.Environment.isNode()) {
    arguments = Array.prototype.slice.call(process.argv);
}
if(System.Environment.isWsh()) {
    var args = [
        null, 
        null
    ];
    for(var i = 0; i < WScript.Arguments.length; i++) {
        args[2 + i] = WScript.Arguments.Item(i);
    }
    arguments = args;
}
main.run(arguments);
