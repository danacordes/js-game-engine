
var config = {
    'version'               : 0.1,
    'fps'                   : 60,
    'tick_length'           : 1000 / 60,
    'tick_backlog_panic'    : 250 //number of frames behind before we reset
};

var GAME = (function(config){
    //config
    config                         = (config !== undefined) ? config : {};
    var _CONST_VERSION              = (config.version !== undefined) ? config.version : 'UNKNOWN',
        _CONST_FPS                  = (config.fps !== undefined) ? config.fps : (1000 / 60),
        _CONST_TICK_LENGTH          = (config.tick_length !== undefined) ? config.tick_length : 50,
        _CONST_TICK_BACKLOG_PANIC   = (config.tick_backlog_panic !== undefined) ? config.tick_backlog_panic : 50,
        _CONST_MOVEMENT_SPEED       = 1;
    var _KEYS = {
        BACKSPACE   : 8,
        TAB         : 9,
        RETURN      : 13, 
        ESC         : 27,
        SPACE       : 32,
        PAGEUP      : 33,
        PAGEDOWN    : 34,
        END         : 35,
        HOME        : 36,
        LEFT        : 37,
        UP          : 38, 
        RIGHT       : 39,
        DOWN        : 40,
        INSERT      : 45,
        DELETE      : 46,
        TILDE       : 192,
        ZERO        : 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57, 
        A           : 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90
    };

    //runstate
    this.run            = false;
    this.lastTick       = false;
    this.lastRender     = false;
    this.nextTick       = false;
    this.tickBacklog    = false;

    //external
    this.startMain              = _startMain;
    this.stopMain               = _stopMain;
    this.registerInputHandlers  = _registerInputHandlers;

    //screen elements
    var _input = {

        rotatingFase    : false,
        reset           : false,
        up              : false,
        down            : false,
        right           : false,
        left            : false

    };

    var _state = {
        box: {
            rotation    : 0,
            x           : 0,
            y           : 0,
            vx          : 0,
            vy          : 0,
            element     : document.getElementById('box')
        }
    };


    function main(callTime){

        //if it's time for gamestate update, determine how many ticks, and then update state
        if(callTime >= this.nextTick){
            this.tickBacklog = Math.floor( 
                ( callTime - this.lastTick ) / _CONST_TICK_LENGTH
            );

            // console.log(this.tickBacklog, callTime - this.lastTick, callTime, this.lastTick, this.nextTick, _CONST_TICK_LENGTH);

            if(this.tickBacklog > _CONST_TICK_BACKLOG_PANIC){
                _panic();
                return;
            }

            _queueGamestate(this.tickBacklog);
            // console.log("update took:", callTime - this.nextTick);


            this.nextTick = this.nextTick + (_CONST_TICK_LENGTH * this.tickBacklog); 
            this.lastTick = this.nextTick - _CONST_TICK_LENGTH;
            // console.log(this.lastTick, this.nextTick);
        }

        //if we're running, requeue
        if(this.run !== false){
            _queueMain();
        }
    }

    function _queueGamestate(tickBacklog){

        console.log(tickBacklog);
        for(var i = 0; i < tickBacklog; i++){//iterate for the requested number of ticks

            _updateGamestate();

        }

        _renderGamestate();
    }

    //main game state update routine
    function _updateGamestate(){
            if(_input.reset){
                _state.box.x = 0;
                _state.box.y = 0;
                _state.box.vx = 0;
                _state.box.vy = 0;
            }

            var rotationRate = _input.rotatingFast ? 15: 5;
            _state.box.rotation = _state.box.rotation < 360 ? _state.box.rotation + rotationRate : 0;

            if(_input.up){
                _state.box.vy -= _CONST_MOVEMENT_SPEED;
            }

            if(_input.down){
                _state.box.vy += _CONST_MOVEMENT_SPEED;
            }

            if(_input.right){
                _state.box.vx += _CONST_MOVEMENT_SPEED;
            }

            if(_input.left){
                _state.box.vx -= _CONST_MOVEMENT_SPEED;
            }

            _applyVector(_state.box);

    }

    //render gamestate onto screen
    function _renderGamestate(){

            _state.box.element.style.transform = 
                'translate(' + _state.box.x + 'px, ' + _state.box.y + 'px) ' +
                'rotate(' + _state.box.rotation + 'deg)';
            console.log(_state.box.element.style.transform);

    }

    function _queueMain(){
        this.run = window.requestAnimationFrame(main);
    }

    function _startMain(){
        console.log("Starting...");

        this.nextTick = window.performance.now() + _CONST_TICK_LENGTH; // next tick time is right now!
        this.lastTick = this.nextTick - _CONST_TICK_LENGTH;  //pretend that one happened previously

        _queueMain();
    }

    function _stopMain(){
        console.log("Stopping...");

        if(this.run !== false){
            this.run = false;
            window.cancelAnimationFrame(this.run);
        }
    }

    function _panic(){
        console.log('Panicking');

        _startMain();
    }

    function _registerInputHandlers(){

        document.addEventListener('keydown', function (event){ return _onKey(event, event.keyCode, true); }, false);
        document.addEventListener('keyup', function (event){ return _onKey(event, event.keyCode, false); }, false);

    }

    function _onKey(event, keycode, keydown){

        switch(keycode){
            case _KEYS.SPACE: 
                _input.rotatingFast = keydown;
                event.preventDefault();
                break;
            case _KEYS.UP: 
                _input.up = keydown;
                event.preventDefault();
                break;
            case _KEYS.DOWN: 
                _input.down = keydown;
                event.preventDefault();
                break;
            case _KEYS.RIGHT: 
                _input.right = keydown;
                event.preventDefault();
                break;
            case _KEYS.LEFT: 
                _input.left = keydown;
                event.preventDefault();
                break;
            case _KEYS.ESC: 
                _input.reset = keydown;
                event.preventDefault();
                break;
        }

    }

    function _applyVector(object){
        if(object.x !== undefined && object.vx !== undefined){
            object.x += object.vx;
        }

        if(object.y !== undefined && object.vy !== undefined){
            object.y += object.vy;
        }
        console.log(object);

        return object;
    }

    return this;

})(config);


(function(GAME){
    console.log(GAME.CONST_VERSION);

    GAME.registerInputHandlers();

    document.getElementById('start').addEventListener('click',function(){
        GAME.startMain();
    });
    document.getElementById('stop').addEventListener('click',function(){
        GAME.stopMain();
    });

})(GAME);