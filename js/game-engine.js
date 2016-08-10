
var config = {
    'version'               : 0.1,
    'fps'                   : 60,
    'tick_length'           : 1000 / 60,
    'tick_backlog_panic'    : 250 //number of frames behind before we reset
};

var GAME = (function(config){
    //config
    config                         = (config !== undefined) ? config : {};
    var _CONST_VERSION              = (config.version !== undefined) ? config.version : 'UNKNOWN';
    var _CONST_FPS                  = (config.fps !== undefined) ? config.fps : (1000 / 60);
    var _CONST_TICK_LENGTH          = (config.tick_length !== undefined) ? config.tick_length : 50;
    var _CONST_TICK_BACKLOG_PANIC   = (config.tick_backlog_panic !== undefined) ? config.tick_backlog_panic : 50;

    //runstate
    this.run            = false;
    this.lastTick       = false;
    this.lastRender     = false;
    this.nextTick       = false;
    this.tickBacklog    = false;

    //external
    this.startMain      = _startMain;
    this.stopMain       = _stopMain;

    //screen elements
    var elements = {
    };

    var state = {
        box: {
            rotation    : 0,
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

            queueGamestate(this.tickBacklog);
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

    function queueGamestate(tickBacklog){

        console.log(tickBacklog);
        for(var i = 0; i < tickBacklog; i++){//iterate for the requested number of ticks

            updateGamestate();

        }

        renderGamestate();
    }

    //main game state update routine
    function updateGamestate(){

            state.box.rotation = state.box.rotation < 360 ? state.box.rotation + 5 : 0;

    }

    //render gamestate onto screen
    function renderGamestate(){

            state.box.element.style.transform = "rotate(" + state.box.rotation + "deg)";

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




    return this;

})(config);


(function(GAME){
    console.log(GAME.CONST_VERSION);

    document.getElementById('start').addEventListener('click',function(){
        GAME.startMain();
    });
    document.getElementById('stop').addEventListener('click',function(){
        GAME.stopMain();
    });

})(GAME);