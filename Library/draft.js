define_ibex_controller({
  name: "PennController",
  jqueryWidget: {    
    _init: function () {

        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;

        this.toSave = [];
        this.toRunBeforeFinish = [];

        var _t = this;

        // The main element
        this.element = $("<div>").addClass("PennController");

        // Dummy object creating the ABORT keyword, used to abort the execution of chained functions (see EXTEND below)
        var Abort = new Object;


        //  =======================================
        //      INTERNAL FUNCTIONS
        //  =======================================

        // Returns a new function executing the one passed as argument after THIS one (chain can be aborted)
        Function.prototype.extend = function(code){
            let t = this;
            return function(){
                if (t.apply(t,arguments) == Abort)
                    return Abort;
                return code.apply(t,arguments);
            }
        }

        // Adds a parameter/line to the list of things to save
        this.save = function(parameter, value, time, comment){
            _t.toSave.push([
                    ["Parameter", parameter],
                    ["Value", value],
                    ["Time", time],
                    ["Comment", comment ? comment : "NULL"]
                ]);
        }

        // Adds a function to be executed before finishedCallBack
        this.callbackBeforeFinish = function(func) {
            _t.toRunBeforeFinish.push(func);
        }

        this.end() = function() {
            _t.callbackBeforeFinish();
            _t.finishedCallBack([_t.toSave]);
        }

        //  =======================================
        //      INSTRUCTIONS
        //  =======================================

        // General Instruction class
        class Instruction {
            constructor(content, type) {
                this.type = type;
                this.content = content;
                this.hasBeenRun = false;
                this.isDone = false;                       
                this.parentElement = _t.element;
                this.element = null;
                this.origin = this;
            }

            done() {
                if (this.isDone)
                    return Abort;
                this.isDone = true;
            }

            run() {
                this.hasBeenRun = true;
            }

            // Converts into a META instruction
            toMeta(source, callback) {
                let ti = this;
                // Rewrite any specific DONE method
                this.done = function(){ 
                    if (this.isDone)
                        return Abort;
                    this.isDone = true;
                };
                // Rewrite any specific RUN method
                this.run = function(){
                    if (!source.hasBeenRun)
                        source.run();
                };
                // This will be called after source is run (actual running of this instruction)
                this.sourceCallback = function(){
                    if (typeof callback == "function")
                        callback.apply(ti, arguments);
                    ti.hasBeenRun = true;
                };
                source.done = source.done.extend(ti.sourceCallback);
                // All other methods are left unaffected
                this.type = "meta";
                this.source = source;
                this.element = source.element;
                this.origin = source.origin;
                return this;
            }
        }



        // Adds a SPAN to the parent element
        // Done immediately
        class TextInstr extends Instruction {
            constructor(text) {
                super(text, "text");
                this.element = $("<span>").html(text);
            }

            run() {
                super.run();
                this.parentElement.append(this.element);
                this.done();
            }

            // ========================================
            // Methods returning INSTRUCTIONS
            
            // Returns an instruction to remove the text
            // Done immediately
            remove() {
                return (new TextInstr(this.origin.content)).toMeta(this, function(){
                    if (this.origin.element instanceof jQuery) {
                        this.origin.element.detach();
                    }
                    this.done();
                });
            }
        }



        // Adds an AUDIO to the parent element
        // Done immediately
        class AudioInstr extends Instruction {
            constructor(file) {
                super(file, "audio");
                this.element = $("<audio>").append($("<source>").html(file));
                this.auto = true;
                this.controls = false;
                this.ended = false;
                let ti = this;
                this.element.on('ended', function(){ ti.ended = true; });
            }

            run() {
                super.run();
                if (this.controls)
                    this.element.attr('controls','true');
                else
                    this.element.css('display','none');
                if (this.auto)
                    this.element.attr('auto','true');
                this.parentElement.append(this.element);
                this.done();
            }

            // ========================================
            // Methods returning INSTRUCTIONS
            
            // Returns an instruction to wait
            // Done when origin's element has been played
            wait() {
                return (new AudioInstr(this.origin.content)).toMeta(this, function(){
                    // If sound's already completely played back, done immediately
                    if (this.origin.ended)
                        this.done();
                    // Else, done when origin's played back
                    else
                        this.origin.element.on('ended', this.done);
                });
            }

            // Returns an instruction to remove the text
            // Done immediately
            remove() {
                return (new AudioInstr(this.origin.content)).toMeta(this, function(){
                    if (this.origin.element instanceof jQuery) {
                        this.origin.element.detach();
                    }
                    this.done();
                });
            }
        }



        // Adds an IMG to the parent element        (to be replaced with image module)    
        // Done immediately
        class ImageInstr extends Instruction {
            constructor(imageURL) {
                super(imageURL, "image");
                this.element = $("<img>").attr(src, imageURL);
            }

            run() {
                super.run();
                this.parentElement.append(this.element);
                this.done();
            }


            // ========================================
            // Methods returning INSTRUCTIONS

            // Returns an instruction to move the image to X,Y
            // Done immediately
            move(x,y) {
                return (new ImageInstr(this.origin.content)).toMeta(this, function {
                    this.origin.element.css({left: x, top: y, position: 'absolute'});
                    this.done();
                });
            }

            // Returns an instruction to resize the image to W,H
            // Done immediately
            resize(w,h) {
                return (new ImageInstr(this.origin.content)).toMeta(this, function(){
                    this.origin.element.css({width: w, height: h});
                    this.done();
                });
            }

            // Returns an instruction to remove the text
            // Done immediately
            remove() {
                return (new ImageInstr(this.origin.content)).toMeta(this, function(){
                    if (this.origin.element instanceof jQuery) {
                        this.origin.element.detach();
                    }
                    this.done();
                });
            }
        }



        // Binds a keypress event to the document
        // Done upon keypress
        class KeyInstr extends Instruction {
            constructor(keys) {
                super(keys, "key");
                this.element = $("<key>");
                this.keys = keys;
            }

            // Called when the right (or any if unspecified) key is pressed
            pressed(key) {
                this.key = key;
                this.time = Date.now();
                this.done();
            }

            // Adds key press event
            run() {
                super.run();
                let ti = this;
                _t.safeBind($(document),"keydown",function(e){
                    // Stop here if instruction is done
                    if (ti.isDone) return;
                    // Handling with JS's weird rules for keyCode
                    let chrCode = e.keyCode - 48 * Math.floor(e.keyCode / 48);
                    let chr = String.fromCharCode((96 <= e.keyCode) ? chrCode: e.keyCode);
                    // If pressed key matches one of the keys (or any key if no string provided)
                    if (typeof ti.keys != "string" || ti.keys.toUpperCase().match(chr)) {
                        ti.pressed(chr);
                    }
                });
            }


            // ========================================
            // Methods returning INSTRUCTIONS

            // Returns an instruction to save the key that was pressed
            // Done immediately
            save(comment) {
                return (new KeyInstr(this.origin.content)).toMeta(this, function(){
                    _t.save('keypress', this.origin.key, this.origin.time, comment);
                    this.done();
                });
            }
        }



        // Runs all instructions passed as arguments
        // Done when all instructions are done (by default, but see the VALIDATION method)
        class ComplexInstr extends Instruction {
            constructor(instructions) {
                super(instructions, "complex");
                this.toBeDone = instructions;       // The instructions still to be done (initial state: all of them)
                this.element = $("<div>");
                // Go through each instruction
                for (i in instructions) {
                    let instruction = instructions[i], ti = this;
                    // Indicate ELEMENT as each instruction's parent element
                    instruction.parentElement = ti.element;
                    // Inform ComplexInstr (call EXECUTED) when each instruction is done
                    instruction.done = instruction.done.extend(function(){ ti.executed(instruction); });
                }
            }

            run() {
                super.run();
                // Append an element (which is the parent for the instructions)
                _t.element.append(this.element);
                // Run each instruction
                for (i in this.content)
                    this.content[i].run();
            }

            // Called when an instruction is done
            executed(instruction) {
                let index = this.toBeDone.indexOf(instruction);
                if (index >= 0)
                    this.toBeDone.slice(index, 1);
                // If there is no instruction left to be done, call done
                if (this.toBeDone.length < 1)
                    this.done();
            }

            // ========================================
            // Methods returning INSTRUCTIONS

            // Returns the instruction itself after setting its validation conditions
            validation(which) {
                let ti = this;
                // If 'any,' complex is done as soon as one instruction is done
                if (which == "any")
                    this.executed = this.done;
                // If WHICH is an index, the complex is done when the index'th instruction is done
                else if (typeof(which) == "number" && which >= 0 && which < this.origin.content.length)
                    this.executed = function(instruction){
                        if (ti.origin.content.indexOf(instruction) == which)
                            ti.done();
                    }
                return this;
            }

            // Returns an instruction to remove the text
            // Done immediately
            remove() {
                return (new ComplexInstr(this.origin.content)).toMeta(this, function(){
                    if (this.origin.element instanceof jQuery) {
                        this.origin.element.detach();
                    }
                    this.done();
                });
            }
        }



        // Adds a radio scale to the parent element
        // Done immediately
        class RadioInstr extends Instruction {
            constructor(label, length) {
                super({label: label, length: length}, "radio");
                this.label = label;
                this.length = length;
                this.values = [];
                this.times = [];
                this.element = $("<form>");
                for (let i = 0; i < length; i++) {
                    let ti = this, input = $("<input type='radio'>").attr({name: label, value: i})
                    input.click(function(){
                        ti.clicked($(this).attr("value"));
                    });
                }
            }

            // Called upon any click on an input
            clicked(value) {
                this.values.push(value);
                this.times.push(Date.now());
            }

            run() {
                super.run();
                this.parentElement.append(this.element);
                this.done();
            }

            // ========================================
            // Methods returning CONDITIONAL FUNCTIONS

            // Returns a function giving selected value/TRUE/TRUE value iff existent/= VALUES/among VALUES
            selected(values) {
                let o = this.origin;
                return function(){
                    if (typeof(values) == "undefined") {
                        if (o.values.length < 1)
                            return false;
                        else
                            return o.values[o.values.length-1];
                    }
                    else if (typeof(values) == "number" || typeof(values) == "string")
                        return (o.values[o.values.length-1] == values);
                    else if (values instanceof Array)
                        return (values.indexOf(o.values[o.values.length-1]) >= 0);
                };
            }


            // ========================================
            // Methods returning INSTRUCTIONS

            // Returns an instruction to wait for a click (on (a) specific value(s))
            // Done upon click meeting the specified conditions (if any)
            wait(values) {
                let instr = (new RadioInstr(this.origin.content)).toMeta(this), ti = this;
                this.origin.clicked = this.origin.clicked.extend(function(value){
                    if (typeof values == "number") {
                        if (value == values)
                            instr.done();
                    }
                    else if (values instanceof Array) {
                        if (values.indexOf(value) >= 0)
                            instr.done();
                    }
                    else
                        instr.done();
                });
                return instr;
            }

            // Returns a 'dummy' instruction, and adds a SAVE command to DONE
            // Done when source (this) is done
            save(parameters, comment) {
                let o = this.origin;
                // If the value to be saved in only the final value (default)
                if (typeof(parameters) != "string" || parameters == "last") {
                    // Store a function to save the value at the end of the trial
                    _t.callbackBeforeFinish(function(){
                        _t.save(o.label, o.values[o.values.length-1], o.times[o.times.length-1], comment);
                    });
                }
                else {
                    this.origin.clicked = this.origin.clicked.extend(function(value){
                        // If all values are to be saved, call _T.SAVE on every click
                        if (parameters == "all")
                            _t.save(o.label, value, Date.now(), comment);
                        // If only saving first selected value, call _T.SAVE on first click
                        else if (parameters == "first" && o.values.length == 1)
                            _t.save(o.label, value, Date.now(), comment);
                    });
                }
                // Returns the instruction itself
                return this;
            }

            // Returns an instruction to remove the text
            // Done immediately
            remove() {
                return (new RadioInstr(this.origin.content)).toMeta(this, function(){
                    if (this.origin.element instanceof jQuery) {
                        this.origin.element.detach();
                    }
                    this.done();
                });
            }
        }



        // Adds a timer
        // Done when timer has ellapsed
        class TimerInstr extends Instruction {
            constructor(delay) {
                super(delay, "timer");
                this.delay = delay;
                this.element = $("<timer>");
                this.step = 10;
            }

            run() {
                super.run();
                this.left = this.delay;
                let ti = this;
                this.timer = setInterval(function(){
                    ti.left -= ti.step;
                    if (ti.left <= 0){
                        ti.left = 0;
                        ti.done();
                    }
                }, this.step);
            }


            // ========================================
            // Methods returning INSTRUCTIONS

            // Returns an instruction that prematurely stops the timer
            // Done immediately
            stop(done) {
                let ti = this, instr = (new TimerInstr(this.origin.content)).toMeta(this, this.done);
                instr.run = function(){ 
                    clearInterval(ti.origin.timer);
                    // If DONE is true, the (origin) timer instruction is considered done upon stopping
                    if (done)
                        ti.origin.done();
                }
                return instr;
            }
            
            // Returns the same instruction after setting the timer's step
            // Done immediately (same instruction)
            step(value) {
                // (Re)set the step
                this.origin.step = value;
                // Return the instruction itself
                return this;
            }

            // Returns the same instruction after restarting the timer
            // Done immediately (same instruction)
            step(value) {
                clearInterval(this.origin.timer);   // In case 
                // Return the instruction itself
                return this;
            }            
        }



        // Executes a function
        // Done immediately
        class FunctionInstr extends Instruction {
            constructor(func) {
                super(func, "function");
                this.element = $("<function>");
                this.func = func;
            }

            run() {
                super.run();
                this.func();
                this.done();
            }
        }



        // Adds something to the list of what is to be saved
        // Done immediately
        class SaveInstr extends Instruction {
            constructor(parameters) {
                super(parameters, "save");
                this.element = $("<save>");
                this.parameter = parameters[0];
                this.value = parameters[1];
                this.comment = parameters[2];
            }

            run() {
                super.run();
                _t.save(this.parameter, this.value, Date.now(), this.comment);
                this.done();
            }
        }




        //  =======================================
        //      DEFINITION OF T
        //  =======================================

        var t = function(arg){
        	// interpreter
        	if (arg in t) console.log("test");

            // Create a new PCElement
        	switch typeof(arg){
        		case "string":
        			if (arg.match(/\.(png|jpe?g|bmp|gif)$/i))    
        				return new ImageInstr(arg);             // Create an image instruction
        			else if (arg.match(/\.(wav|ogg|mp3)$/i))
        				return new AudioInstr(arg);             // Create an audio instruction
        			else 
        				return new TextInstr(arg);              // Create a text instruction
        		break;
        		case "number":
        			return new TimerInstr(arg);                 // Create a timer instruction
        		break;
                case "function":
                    return new FunctionInstr(arg);              // Create a function instruction
                break;
                case "Object":
                    return new ComplexInstr(arguments);         // Create a complex instruction
                break;
        	}
        };

        t.text = function(text){ return new TextInstr(text); };
        t.image = function(image){ return new ImageInstr(iamge); };
        t.audio = function(audio){ return new AudioInstr(audio); };
        t.key = function(keys){ return new KeyInstr(keys); };
        t.save = function(){ return new SaveInstr(arguments); };
        // t.tooltip = function(text){ return new TooltipInstr(text); }; // To be implemented
        // t.if = function(condition, success, failure){ return new IfInstr(condition, success, failure); };
        // t.waitUntil = function(condition){ return new WaitInstr(condition); };
        t.radioButtons = function(label, length){ return new RadioInstr(label, length); };

        // Instantiate T with the item's parameters
        _t.func(t);

        // Make it so that each instruction runs next one
        let previous;
        for (let i in t.instructions) {
            let next = t.instructions[i];
            // Run next instruction when previous is done
            if (previous instanceof Instruction)
                previous.done = previous.done.extend(next.run);
            previous = next;
        }
        // Now previous is the last instruction
        previous.done = previous.done.extend(_t.end());


        // Now run the first instruction!
        t.instructions[0].run();
  },
  properties: {
    obligatory: ["func"],
    countsForProgressBar: false,
    htmlDescription: null
  }
});


function PennController(itemLabel, content){
	return [itemLabel, "PennController", {func: content}];
}

PennController.Configure = function(parameters){
    for (parameter in parameters){
        if (parameter.indexOf["PreloadResources","Configure"] < 0) // Don't override built-in functions/parameters
            PennController[parameter] = parameters[parameter];
    }
    /*
        baseURL: "http://.../",
        ImageURL: "http://.../",
        AudioURL: "http://.../",
        ...
    */
};

PennController.Preloader = {
    Load: function(urls){
                switch typeof(urls){
                    case "string":
                        // load files from urls
                    break;
                    case "Object":
                        if (urls instanceof Array){
                            for (url in urls){
                                // load files from urls[url]
                            }
                        }
                    break;
                }
                return "Success";
        },
    Resources: {
        Images: null,
        Audio: null
    }
};


PennController("item", function(t){
    // bunch of settings
	t.speed = 50;
	t.fixed = true;
    // script of the trial
	t.instructions = [
		// Layout
		t("Some text"),
		t("image.png"),
		t.text("image.png"),
		t("file.wav").save(),    //  saves everything: starts playing, pauses, clicks on UI, ...
		t.text("file.wav"),
		t.image("image1"),
		// Interactions
		t(2000),
		t.key(" ").save(),       //  saves which key was pressed and when it happened
        t(t.text("Left label"), scale = t.radioButtons("judgment", 5).save().wait(), t.text("Right label")),
        // add .wait to both instructions
        t.if(scale.selected(5),
            t.tooltip(scale, "Correct...").wait(),
            t.tooltip(scale, "Wrong: ...").wait()
        ),
        // same as adding it to if
        t.if(scale.selected(5),
            t.tooltip(scale, "Correct..."),
            t.tooltip(scale, "Wrong: ...")
        ).wait(),
        t.waitUntil(scale.selected(5));
		t("Thank you!"),
		t.key(" ")
	]

    scale.click(function(){
        t("image1").pic("image2.png");
    });
})