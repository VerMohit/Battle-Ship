document.addEventListener('DOMContentLoaded', function() {

    // Defining constant parameters for the game
    let ship_Angle = 0;          // Tracks the orientation of the ship (0 = horizontal, 90 = vertical)
    let player_Dragged_Ship;     // Keep track of which ship the Player drags
    let isShip_Dropped;          // Boolean to check and see if ship is dropped onto Player Board
    let player_hit_Counter = 0;
    let player_miss_Counter = 0;
    let computer_hit_Counter = 0;
    let computer_miss_Counter = 0;
    let player_Hits = [];             // list of ship name player hit
    let computer_Hits = [];           // list of ship name computer hit
    let game_Over = false;            // Boolean tracks if game is over
    let player_Turn;                  // Boolean tracks player turn: true = human; false = computer
    const player_Sunk_Ships = [];     // list of all ships the player has sunken
    const computer_Sunk_Ships = [];     // list of all ships the computer has sunken
    const boardCols = 10;
    const boardRows = 10;
    const boardSquares = boardCols * boardRows;
    const game_Container = document.querySelector('.game-container');
    const rotate_Btn = document.querySelector('.rotate');
    const start_Btn = document.querySelector('.start');
    const restart_Btn = document.querySelector('.restart');
    const ships_Container = document.querySelector('.ships-container');    
    const info_Display = document.querySelector('.info');
    const turn_Display = document.querySelector('.turn');
    
    // --------- Functions ---------
    function createBoard(user) {
        /* Function used to create new player and computer boards */

        const gameBoardCont = document.createElement('div');
        
        const userTitle = document.createElement('p');
        userTitle.textContent = user;
        userTitle.classList.add('boardTitle');

        const hit = document.createElement('p');
        hit.classList.add(user + '-hit-label');
        hit.textContent = 'Hit: ';
        const span_hit = document.createElement('span');       
        span_hit.textContent = '0'
        span_hit.classList.add(user + '-hit-counter');
        hit.appendChild(span_hit);

        const miss = document.createElement('p');
        miss.classList.add(user + '-miss-label');
        miss.textContent = 'Miss: ';
        const span_miss = document.createElement('span');
        span_miss.textContent = '0'
        span_miss.classList.add(user + '-miss-counter');
        miss.appendChild(span_miss);

        userTitle.textContent = user;
        userTitle.classList.add('boardTitle');

        const gameBoard = document.createElement('div');
        gameBoard.classList.add('gameBoard');
        gameBoard.id = user;
        gameBoard.style.backgroundColor = 'lightblue'

        for (let ii = 0; ii < boardSquares; ii++) {  
            const cell = document.createElement('div');     
            const circle = document.createElement('div');

            circle.classList.add('circle');   
            circle.id = ii;
            cell.appendChild(circle)
            cell.classList.add('cell');
            cell.id = ii;
            gameBoard.appendChild(cell);
        }

        gameBoardCont.appendChild(userTitle);
        gameBoardCont.appendChild(hit);
        gameBoardCont.appendChild(miss);
        gameBoardCont.appendChild(gameBoard);
        game_Container.appendChild(gameBoardCont);
    }

    function create_Ship_Previews(shipObj, index) {
        /* Function dynamically creates previews of the ships */
        const ship = document.createElement('div');
        ship.classList.add('view-'+ shipObj.name, shipObj.name);
        ship.id = index;
        ship.draggable = true;
        ship.addEventListener('dragstart', onDragStart);
        ships_Container.appendChild(ship);
    }

    function rotate_Ship(){
        /* Function rotates the ships in the .ships-container */
        const ships = Array.from(ships_Container.children);
        ship_Angle = ship_Angle === 0 ? 90 : 0;
        ships.forEach((shipPreview) =>  
            shipPreview.style.transform=`rotate(${ship_Angle}deg)`
        );
    }

    function check_Valid_Move(start_Cell, shipObj, board_Cells, is_Horizontal) {
        /* This function checks if the ship placement is valid or not */

         // Determine valid positions for each shipObj based on its orientation and allowable dimensions
         let valid_Start = start_Cell;        // Define valid initial start lcoation of shipObj
         let last_Ship_Cell;                  // Find the last cell occupied by the shipObj
         let valid_Move = true;              // Identifies if the ship placement was valid
         
         if(is_Horizontal) {
             // Guarentees that the shipObj starting position doesn't exceed last cell (ie. cell with id=99)
             valid_Start = valid_Start > boardSquares - shipObj.length ? boardSquares - shipObj.length : valid_Start;

             // Find the last cell occupied by the shipObj 
             last_Ship_Cell = board_Cells[valid_Start + shipObj.length - 1].id;
             // Ensure that column of the shipObj's start position is less than column of end position
             if(valid_Start % boardCols > last_Ship_Cell % boardCols) {
                 valid_Move = false;
             }
         }
         else {
             // Guarentees we never overflow vertically at all (ie. we don't go below the grid)
             valid_Start = valid_Start > boardSquares - (shipObj.length * boardCols) ? valid_Start - (shipObj.length * boardCols) + boardCols : valid_Start;
             // Find the last cell occupied by the shipObj
             last_Ship_Cell = board_Cells[valid_Start + (shipObj.length - 1) * boardCols].id;
         }
 
         // Prevent ships from overlapping
         let cells_Covered = [];
         let cell_Not_Taken = true;
         for(let ii = 0; ii < shipObj.length; ii++) {
             let cell = is_Horizontal ? 
                                         board_Cells[valid_Start + ii] : 
                                         board_Cells[valid_Start + (ii * boardCols)];
             if(cell.classList.contains('taken')) {
                 cell_Not_Taken = false;
                 break;
             }
             else{
                 cells_Covered.push(cell);
             }
         }

         return [cells_Covered, valid_Move, cell_Not_Taken];
    }

    function place_Ships_On_Board(user_Board, shipObj, start_Loc) {
        /* Function randomly places ships on the computer board and provides logic to ensure the player places ships in valid positions */

        // Get nodeList of all the children contained in the element with id=Computer
        const board_Cells = Array.from(document.querySelector('#' + user_Board).children);
        // console.log(board_Cells);
        
        // DetRandomly determine if the position of the ship will be horizontal (ie. true)
        let is_Horizontal;

        if(user_Board === "Computer"){
            is_Horizontal = Math.random() <= 0.5;
        }
        else {
            is_Horizontal = (ship_Angle === 0);
        }

        // Get a random start position for the computer's ships (between 0 and 99, inclusive)
        let random_Ship_Start = Math.floor(Math.random() * boardSquares);

        // Specify the start position of the shipObj
        let start_Cell = start_Loc >= 0 ? start_Loc : random_Ship_Start;

        // Check the validity of the ship placement
        const [cells_Covered, valid_Move, cell_Not_Taken] = check_Valid_Move(start_Cell, shipObj, board_Cells, is_Horizontal);

        // If move is not valid or any cell is already taken, recall function
        if(!valid_Move || !cell_Not_Taken) {
            if(user_Board === "Computer") {
                place_Ships_On_Board(user_Board, shipObj, undefined);
            }
            if(user_Board === "Player") {
                // isShip_Dropped = true;
                isShip_Dropped = false;
            }
            
        }
        else {
            // Update class name for each covered cell in the array
            cells_Covered.forEach((cell) => {
                cell.classList.add(shipObj.name, 'taken');                            
            });

        }       
    }

    function highlight_Ship_Placement(start_Cell, shipObj) {
        /* Function will highlight the cell on player's board when ship is being placed via drag */

        // Check if horizontal
        let is_Horizontal = ship_Angle === 0;

        // Check validity of the ship placement on player's board
        const [cells_Covered, valid_Move, cell_Not_Taken] = check_Valid_Move(start_Cell, shipObj, player_Board_Cells, is_Horizontal);

        // If ship placement is valid and cells aren't taken, highlight cells
        if(valid_Move && cell_Not_Taken) {
            cells_Covered.forEach(cell => {
                cell.classList.add('hover-'+shipObj.name);
                // Remove the class .hover after x miliseconds
                setTimeout(() => cell.classList.remove('hover-'+shipObj.name), 400);
            })
        }
    }

    function restart_Game() {
        /* Function resets parameters for the game */

        // Reset ship placement on player's board
        player_Board_Cells.forEach(cell => {
            cell.classList.remove('taken', 'carrier', 'battleship', 'destroyer', 'submarine', 'cruiser', 'hover-carrier', 'hover-battleship', 'hover-destroyer', 'hover-submarine', 'hover-cruiser', 'empty', 'strike');
            cell.removeAttribute('data-selected');
        });
    
        // Reset ship previews
        ships_Container.textContent = '';
        ship_Arr.forEach((ship, index) => create_Ship_Previews(ship, index));
    
        // Reset hit counters
        player_hit_Counter = 0;
        player_miss_Counter = 0;
        computer_hit_Counter = 0;
        computer_miss_Counter = 0;
        document.querySelector('.Player-hit-counter').textContent = '0';
        document.querySelector('.Player-miss-counter').textContent = '0';
        document.querySelector('.Computer-hit-counter').textContent = '0';
        document.querySelector('.Computer-miss-counter').textContent = '0';
    
        // Reset hit arrays and sunk ships arrays
        player_Hits = [];
        computer_Hits = [];
    
        // Reset game over status and player's turn
        game_Over = false;
        player_Turn = undefined;
    
        // Clear info and turn displays
        info_Display.textContent = 'Place the remaining ' + no_Of_Ships + ' pieces on the board before playing!';
        turn_Display.textContent = '';
    }

    function start_Game() {
        /* Function will be used to start the game */

        // Ensures that nothing happens if user presses START button during game play
        if(player_Turn === undefined){
            // Make sure that the container holding ships is empty to start the game ()ie. all ships have been placed)
            if(!ships_Container.hasChildNodes()) {
                // Store all the div elements of the computer's board
                const comp_Board_Cells = Array.from(document.querySelector('#Computer').children);

                // Assign each cell of the computer board an onclick event listener
                comp_Board_Cells.forEach(cell => {
                    cell.addEventListener('click', player_Move);
                });

                player_Turn = true;        
                info_Display.textContent='Make your move';
                turn_Display.textContent = 'Player\'s Turn';

            }
            else {
                alert('Place all ships on the board before starting the game!')
            }
        }        
    }

    function player_Move(event) {
        /* Function defines the logic for the Player's move */

        if(!game_Over) {

            const comp_Board_Cells = Array.from(document.querySelector('#Computer').children);            

            // Check to see if cell already chosen. If so, show alert and allow user to make another move.
            if(event.target.getAttribute('data-selected') === 'true') {
                alert('Pick another cell!');
                return;
            }
            else{
                event.target.setAttribute('data-selected', 'true');
            }

            // What to do when a ship is hit
            if(event.target.classList.contains('taken')) {
                const cell = event.target.classList
                cell.add('strike');
                player_hit_Counter += 1;

                // For the chosen target cell, filter through its classNames and only keep the ship's name
                // We will then append it to an array to track if each ship has sunken or not
                let filtered_Class = Array.from(cell);
                filtered_Class = filtered_Class.filter(className => className !== 'cell' && 
                                                                    className !== 'strike' && 
                                                                    className !== 'taken');

                // Put the filtered cell (ie. ship name) into the player's hit array using the spread operator
                player_Hits.push(...filtered_Class);
                console.log(player_Hits)

                info_Display.textContent='Nice, you hit the computer\'s ' + filtered_Class + '!';
                document.querySelector('.Player-hit-counter').textContent = player_hit_Counter;

                // Check if the player's score
                score_Check('Player', player_Hits, player_Sunk_Ships);
            }

            // What to do when we miss
            if(!event.target.classList.contains('taken')) {
                // Give missed cell className .empty
                event.target.classList.add('empty');
                player_miss_Counter += 1;

                info_Display.textContent='Looks like you missed!';
                document.querySelector('.Player-miss-counter').textContent = player_miss_Counter;
            }

            // Update player turn
            player_Turn = false;

            // Remove the event listener added to each cell on the computer's board
            comp_Board_Cells.forEach(cell => {
                cell.removeEventListener('click', player_Move);
            });

            // Specify how long the computer waits before its turn
            setTimeout(computers_Move, 3000);
        }       
    }    

    function computers_Move() {
        /* Function defines the logic for the computer's move */

        if(!game_Over) {
            turn_Display.textContent = 'Computer\'s Turn';
            info_Display.textContent = 'The computer\'s coming for your ship...'
        }

        // Set computer to make its move after some time
        setTimeout(() => {

            // Randomly choose number b/w 0 to (boardSqaures - 1), inclusively
            let comp_Chosen_Cell = Math.floor(Math.random() * boardSquares);

            // Store the classList information
            const cell = player_Board_Cells[comp_Chosen_Cell].classList;
            
            // Let computer redo move it square has already been chosen
            if(cell.contains('taken') && cell.contains('strike')) {
                computers_Move();
                return;
            }
            else if(cell.contains('taken') && !cell.contains('strike')) {
                cell.add('strike');
                computer_hit_Counter += 1;

                let filtered_Class = Array.from(cell);
                filtered_Class = filtered_Class.filter(className => className !== 'cell' && className !== 'strike' && className !== 'taken');

                console.log('computer hit', filtered_Class);

                // Put the filtered cell (ie. ship name) into the player's hit array using the spread operator
                computer_Hits.push(...filtered_Class);
                // console.log(computer_Hits)

                info_Display.textContent='The computer hit your ' + filtered_Class + '!';
                document.querySelector('.Computer-hit-counter').textContent = computer_hit_Counter;

                // Check if the computer's score
                score_Check('Computer', computer_Hits, computer_Sunk_Ships);
            }
            else {
                cell.add('empty');
                computer_miss_Counter += 1;

                info_Display.textContent='The computer missed!';
                document.querySelector('.Computer-miss-counter').textContent = computer_miss_Counter;
            }

        }, 1500);


        // After a certain time, change the turn back to the Player
        setTimeout(() => { 
        
            player_Turn = true;

            turn_Display.textContent = 'Player\'s Turn';
            info_Display.textContent='Make your move';

            // Add the onclick event listener back to the computer's board
            const comp_Board_Cells = Array.from(document.querySelector('#Computer').children);

            comp_Board_Cells.forEach(cell => {
                cell.addEventListener('click', player_Move);
            });
        
        }, 3000);
    }

    function score_Check(user, hits_Arr, sunk_Ships_Arr) {  
        /* Function keeps track of sunken ships and determines the winner */

        // Check to see if any ships has sunk
        ship_Arr.forEach(shipObj => {
            // Check if we have same number of the ship name as its length; if so, its sunk
            if(hits_Arr.filter(ship_Name => ship_Name === shipObj.name).length === shipObj.length) {                      

                // Remove the name of sunken ship from the users *_hit array (don't need to keep track of it anymore)
                if(user === 'Player') {
                    player_Hits = hits_Arr.filter(ship_Name => ship_Name !== shipObj.name);
                    info_Display.textContent = `You sunk the Computer\'s ${shipObj.name}!`;  
                }
                else if(user === 'Computer') {
                    computer_Hits = hits_Arr.filter(ship_Name => ship_Name !== shipObj.name);
                    info_Display.textContent = `The Computer sunk your ${shipObj.name}!`;  
                }

                // Append the ship name to the user's sunk_Ship_Arr
                sunk_Ships_Arr.push(shipObj.name);

            } 
        });

        console.log('player_hits', player_Hits);
        console.log('player_Sunk_Ships', player_Sunk_Ships);
        console.log('comp_hits', computer_Hits);
        console.log('comp_Sunk_Ships', computer_Sunk_Ships);

        if(player_Sunk_Ships.length === 5) {
            info_Display.textContent='You sunk all the computers ships! You WIN!';
            alert('You sunk all the computers ships!\nYou WIN!');
            game_Over = true;
        }

        if(computer_Sunk_Ships.length === 5) {
            info_Display.textContent='You lost all your ships! You LOST!';
            alert('You lost all your ships! You LOST!');
            game_Over = true;
        }        
    }

    // Logic for allowing players to drag ships and place them on their board   
    function onDragStart(event) {
        /* Function executed when user starts dragging ship */

        // Store information about which ship the player is dragging
        player_Dragged_Ship = event.target;

        // isShip_Dropped = false;
        isShip_Dropped = true;
    }

    function onDragOver(event) {
        /* Allows target container to receive drop events */ 

        // Override browser default behaviour for elements to allow dropping
        event.preventDefault();

        // Identify shipObj being dragged over
        const shipObj = ship_Arr[Number(player_Dragged_Ship.id)];

        // Define the starting cell as the one we're dragging over
        let start_Cell = Number(event.target.id);

        // Highlight the area on the player's board
        highlight_Ship_Placement(start_Cell, shipObj);


    }

    function onDrop(event) {
        /* Target cell on which the ships will be placed */ 

        // Identify which cell the ship will be palced
        const player_Start_Loc = Number(event.target.id);

        // Place ship on player's board by first identifying the ship object
        const shipObj = ship_Arr[Number(player_Dragged_Ship.id)];

        // player_Board_Cells.forEach(cell => {
        //     cell.classList.remove(shipObj.name, 'taken');
        // });
        

        // Player can now place their ships
        place_Ships_On_Board("Player", shipObj, player_Start_Loc);        
        
        // Once the ship has been dropped onto board cell, remove it from the DOM
        if (isShip_Dropped) {
            player_Dragged_Ship.remove();
            no_Of_Ships = no_Of_Ships - 1;
        }

        // Give live feedback on how many ships remain to be placed
        if(ships_Container.hasChildNodes()) {
            info_Display.textContent = 'Place the remaining ' + no_Of_Ships + ' pieces on the board before playing!'
            // no_Of_Ships = no_Of_Ships - 1;
        }
        else {
            info_Display.textContent = 'Press START to begin playing!';
        }


    }



    // --------- Game Setup --------- 

    // Create board
    createBoard('Player');
    createBoard('Computer');    

    // Store all the div elements of the player's board
    const player_Board_Cells = Array.from(document.querySelector('#Player').children);

    // Add the onDragOver and onDrop for each cell on the player's board
    player_Board_Cells.forEach(cell => {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('drop', onDrop);
    })

    // Create ship objects for game
    class Ship {
        constructor(name, length) {
            this.name = name;
            this.length = length;
        }
    }

    const carrier = new Ship('carrier', 5);
    const battleship = new Ship('battleship', 4);
    const destroyer = new Ship('destroyer', 3);
    const submarine = new Ship('submarine', 3);
    const cruiser = new Ship('cruiser', 2);

    const ship_Arr = [carrier, battleship, destroyer, submarine, cruiser];   

    // Initialize randomized ship placement on Computer Board
    // Passing undefined as start_Loc
    ship_Arr.forEach((shipObj) => place_Ships_On_Board("Computer", shipObj, undefined));

    // Create ships for previewing
    ship_Arr.forEach((ship, index) => create_Ship_Previews(ship, index));

    let no_Of_Ships = ships_Container.children.length;
    info_Display.textContent = 'Place the remaining ' + no_Of_Ships + ' pieces on the board before playing!'

    // Button logic for flipping ships in the container
    rotate_Btn.addEventListener('click', rotate_Ship);

    // Button logic for starting the game
    start_Btn.addEventListener('click', start_Game);

    // Button logic for restarting the game
    restart_Btn.addEventListener('click', restart_Game);
});
