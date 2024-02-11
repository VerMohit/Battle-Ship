document.addEventListener('DOMContentLoaded', function() {

    // Defining constant parameters for the game
    let ship_Angle = 0;          // Tracks the orientation of the ship (0 = horizontal, 90 = vertical)
    let player_Dragged_Ship;  // Keep track of which ship the Player drags
    let isShip_Dropped;          // Boolean to check and see if ship is dropped onto Player Board
    const boardCols = 10;
    const boardRows = 10;
    const boardSquares = boardCols * boardRows;
    const game_Container = document.querySelector('.game-container');
    const rotate_Btn = document.querySelector('.rotate');
    const ships_Container = document.querySelector('.ships-container');
    
    // --------- Functions ---------
    function createBoard(user) {
        /* Function used to create new player and computer boards */

        const gameBoardCont = document.createElement('div');
        
        const userTitle = document.createElement('p');
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
        gameBoardCont.appendChild(gameBoard);
        game_Container.appendChild(gameBoardCont);
    }


    function create_Ship_Previews(shipObj, index) {
        /* Function dynamically creates previews of the ships */
        const ship = document.createElement('div');
        // ship.classList.add(`view-${shipObj.name}`, `${shipObj.name}`);
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
            //  console.log(board_Cells[valid_Start + shipObj.length])
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
        let random_Ship_Start = Math.floor(Math.random() * 100);

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








    // --------- Game Setup --------- 

    // Create board
    createBoard('Player');
    createBoard('Computer');    

    // Store all the div elements of the player's board
    const player_Board_Cells = Array.from(document.querySelector('#Player').children);

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
    // Passing in 0 as start_Loc as 
    // ship_Arr.forEach((shipObj) => place_Ships_On_Board(shipObj));
    ship_Arr.forEach((shipObj) => place_Ships_On_Board("Computer", shipObj, undefined));


    // Create ships for previewing
    // const ships_Container = document.querySelector('.ships-container');
    ship_Arr.forEach((ship, index) => create_Ship_Previews(ship, index));

    // Button logic for flipping ships in the container
    // rotate_Btn.addEventListener('click', rotate);
    rotate_Btn.addEventListener('click', rotate_Ship);


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
        }

    }


    // Add the onDragOver and onDrop for each cell on the player's board
    player_Board_Cells.forEach(cell => {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('drop', onDrop);
    })

    

    



});
















































// -----------------------------------------------------------------------------




// document.addEventListener('DOMContentLoaded', function() {

//     // Defining constant parameters for the game
//     let ship_Angle = 0; 
//     let player_Dragged_Ship;  // Keep track of which ship the Player drags
//     let isShip_Dropped;          // Boolean to check and see if ship is dropped onto Player Board
//     const boardCols = 10;
//     const boardRows = 10;
//     const boardSquares = boardCols * boardRows;
//     const game_Container = document.querySelector('.game-container');
//     const rotate_Btn = document.querySelector('.rotate');
//     const ships_Container = document.querySelector('.ships-container');
    
//     // --------- Functions ---------
//     function createBoard(user) {
//         /* Function used to create new player and computer boards */

//         const gameBoardCont = document.createElement('div');
        
//         const userTitle = document.createElement('p');
//         userTitle.textContent = user;
//         userTitle.classList.add('boardTitle');

//         const gameBoard = document.createElement('div');
//         gameBoard.classList.add('gameBoard');
//         gameBoard.id = user;
//         gameBoard.style.backgroundColor = 'lightblue'

//         for (let ii = 0; ii < boardSquares; ii++) {  
//             const cell = document.createElement('div');     
//             const circle = document.createElement('div');

//             circle.classList.add('circle');   
//             circle.id = ii;
//             cell.appendChild(circle)
//             cell.classList.add('cell');
//             cell.id = ii;
//             gameBoard.appendChild(cell);
//         }

//         gameBoardCont.appendChild(userTitle);
//         gameBoardCont.appendChild(gameBoard);
//         game_Container.appendChild(gameBoardCont);
//     }



//     // function rotate(){
//     //     /* Function rotates the ships in the .ships-container */
//     //     ship_Angle = ship_Angle === 0 ? 90 : 0;
//     //     ships_container_Arr.forEach((shipPreview) =>  
//     //         shipPreview.style.transform=`rotate(${ship_Angle}deg)`
//     //     );
//     // }

//     function create_Ship_Previews(shipObj, index) {
//         /* Function dynamically creates previews of the ships */
//         const ship = document.createElement('div');
//         // ship.classList.add(`view-${shipObj.name}`, `${shipObj.name}`);
//         ship.classList.add('view-'+ shipObj.name, shipObj.name);
//         ship.id = index;
//         ship.draggable = true;
//         ship.addEventListener('dragstart', onDragStart);
//         ships_Container.appendChild(ship);
//     }

//     function rotate_Ship(){
//         /* Function rotates the ships in the .ships-container */
//         const ships = Array.from(ships_Container.children);
//         ship_Angle = ship_Angle === 0 ? 90 : 0;
//         ships.forEach((shipPreview) =>  
//             shipPreview.style.transform=`rotate(${ship_Angle}deg)`
//         );
//     }

//     // function place_Ships_On_Board(shipObj) {
//     //     /* Function randomly places ships on the computer board at start of game */

//     //     // Get nodeList of all the children contained in the element with id=Computer
//     //     const compBoardCells = document.querySelector('#Computer').children;
        

//     //     // Get a random start position for the ships (between 0 and 99, inclusive)
//     //     let ship_Start = Math.floor(Math.random() * 100);

//     //     // Randomly determine if the position of the ship will be horizontal (ie. true)
//     //     let is_Horizontal = Math.random() <= 0.5;

//     //     // Determine valid positions for each shipObj based on its orientation and allowable dimensions
//     //     let valid_Start = ship_Start;        // Define initial start lcoation of shipObj
//     //     let last_Ship_Cell;                  // Find the last cell occupied by the shipObj
//     //     let valid_Move = true;              // Identifies if the ship placement was valid
        
//     //     if(is_Horizontal) {
//     //         // Guarentees that the shipObj starting position doesn't exceed last cell (ie. cell with id=99)
//     //         valid_Start = valid_Start > boardSquares - shipObj.length ? boardSquares - shipObj.length : valid_Start;
//     //         // Find the last cell occupied by the shipObj
//     //         last_Ship_Cell = compBoardCells[valid_Start + shipObj.length - 1].id;
//     //         // Ensure that column of the shipObj's start position is less than column of end position
//     //         if(valid_Start % boardCols > last_Ship_Cell % boardCols) {
//     //             valid_Move = false;
//     //         }
//     //     }
//     //     else {
//     //         // Guarentees we never overflow vertically at all (ie. we don't go below the grid)
//     //         valid_Start = valid_Start > boardSquares - (shipObj.length * boardCols) ? valid_Start - (shipObj.length * boardCols) + boardCols : valid_Start;
//     //         // Find the last cell occupied by the shipObj
//     //         last_Ship_Cell = compBoardCells[valid_Start + (shipObj.length - 1) * boardCols].id;
//     //     }

//     //     // console.log(shipObj);
//     //     // console.log('first cell ' + ship_Start)
//     //     // console.log('last cell ' + last_Ship_Cell)        
//     //     // console.log('valid move? ' + valid_Move)

//     //     // Prevent ships from overlapping
//     //     let cells_Covered = [];
//     //     let cell_Not_Taken = true;
//     //     for(let ii = 0; ii < shipObj.length; ii++) {
//     //         let cell = is_Horizontal ? 
//     //                                     compBoardCells[valid_Start + ii] : 
//     //                                     compBoardCells[valid_Start + (ii * boardCols)];
//     //         if(cell.classList.contains('taken')) {
//     //             cell_Not_Taken = false;
//     //             break;
//     //         }
//     //         else{
//     //             cells_Covered.push(cell);
//     //         }
//     //     }

//     //     // If move is not valid or any cell is already taken, recall function
//     //     if(!valid_Move || !cell_Not_Taken) {
//     //         place_Ships_On_Board(shipObj);
//     //     }
//     //     else {
//     //         // Update class name for each covered cell in the array
//     //         cells_Covered.forEach((cell) => {
//     //             cell.classList.add(shipObj.name, 'taken');                            
//     //         });
//     //     }       
//     // }


//     // ----------------------------------------------------------------------------


//     function place_Ships_On_Board(user_Board, shipObj, start_Loc) {
//         /* Function randomly places ships on the computer board and provides logic to ensure the player places ships in valid positions */

//         console.log(typeof(shipObj.length));

//         // Get nodeList of all the children contained in the element with id=Computer
//         const board_Cells = Array.from(document.querySelector('#' + user_Board).children);
//         console.log(board_Cells);
        
//         // DetRandomly determine if the position of the ship will be horizontal (ie. true)
//         let is_Horizontal;

//         if(user_Board === "Computer"){
//             is_Horizontal = Math.random() <= 0.5;
//         }
//         else {
//             is_Horizontal = (ship_Angle === 0);
//         }

//         // Get a random start position for the computer's ships (between 0 and 99, inclusive)
//         let random_Ship_Start = Math.floor(Math.random() * 100);

//         // Specify the start position of the shipObj
//         let start_Cell = start_Loc >= 0 ? start_Loc : random_Ship_Start;

//         // Determine valid positions for each shipObj based on its orientation and allowable dimensions
//         let valid_Start = start_Cell;        // Define valid initial start lcoation of shipObj
//         let last_Ship_Cell;                  // Find the last cell occupied by the shipObj
//         let valid_Move = true;              // Identifies if the ship placement was valid
        
//         if(is_Horizontal) {
//             // Guarentees that the shipObj starting position doesn't exceed last cell (ie. cell with id=99)
//             valid_Start = valid_Start > boardSquares - shipObj.length ? boardSquares - shipObj.length : valid_Start;

//             console.log(valid_Start)
//             console.log(typeof(valid_Start))
//             console.log(valid_Start + shipObj.length)
//             // Find the last cell occupied by the shipObj

//             console.log(board_Cells[valid_Start + shipObj.length])
//             last_Ship_Cell = board_Cells[valid_Start + shipObj.length - 1].id;
//             // Ensure that column of the shipObj's start position is less than column of end position
//             if(valid_Start % boardCols > last_Ship_Cell % boardCols) {
//                 valid_Move = false;
//             }
//         }
//         else {
//             // Guarentees we never overflow vertically at all (ie. we don't go below the grid)
//             valid_Start = valid_Start > boardSquares - (shipObj.length * boardCols) ? valid_Start - (shipObj.length * boardCols) + boardCols : valid_Start;
//             // Find the last cell occupied by the shipObj
//             last_Ship_Cell = board_Cells[valid_Start + (shipObj.length - 1) * boardCols].id;
//         }

//         // console.log(shipObj);
//         // console.log('first cell ' + ship_Start)
//         // console.log('last cell ' + last_Ship_Cell)        
//         // console.log('valid move? ' + valid_Move)

//         // Prevent ships from overlapping
//         let cells_Covered = [];
//         let cell_Not_Taken = true;
//         for(let ii = 0; ii < shipObj.length; ii++) {
//             let cell = is_Horizontal ? 
//                                         board_Cells[valid_Start + ii] : 
//                                         board_Cells[valid_Start + (ii * boardCols)];
//             if(cell.classList.contains('taken')) {
//                 cell_Not_Taken = false;
//                 break;
//             }
//             else{
//                 cells_Covered.push(cell);
//             }
//         }

//         // If move is not valid or any cell is already taken, recall function
//         if(!valid_Move || !cell_Not_Taken) {
//             if(user_Board === "Computer") {
//                 place_Ships_On_Board(user_Board, shipObj, undefined);
//             }
//             if(user_Board === "Player") {
//                 isShip_Dropped = true;
//             }
            
//         }
//         else {
//             // Update class name for each covered cell in the array
//             cells_Covered.forEach((cell) => {
//                 cell.classList.add(shipObj.name, 'taken');                            
//             });

//         }       
//     }










//     // --------- Game Setup --------- 

//     // Create board
//     createBoard('Player');
//     createBoard('Computer');    

//     // Create ship objects for game
//     class Ship {
//         constructor(name, length) {
//             this.name = name;
//             this.length = length;
//         }
//     }

//     const carrier = new Ship('carrier', 5);
//     const battleship = new Ship('battleship', 4);
//     const destroyer = new Ship('destroyer', 3);
//     const submarine = new Ship('submarine', 3);
//     const cruiser = new Ship('cruiser', 2);

//     const ship_Arr = [carrier, battleship, destroyer, submarine, cruiser];   

  

//     // Initialize randomized ship placement on Computer Board
//     // Passing in 0 as start_Loc as 
//     // ship_Arr.forEach((shipObj) => place_Ships_On_Board(shipObj));
//     ship_Arr.forEach((shipObj) => place_Ships_On_Board("Computer", shipObj, undefined));


//     // Create ships for previewing
//     // const ships_Container = document.querySelector('.ships-container');
//     ship_Arr.forEach((ship, index) => create_Ship_Previews(ship, index));

//     // Button logic for flipping ships in the container
//     // rotate_Btn.addEventListener('click', rotate);
//     rotate_Btn.addEventListener('click', rotate_Ship);


//     // Logic for allowing players to drag ships and place them on their board   
//     function onDragStart(event) {
//         /* Function executed when user starts dragging ship */

//         // Store information about which ship the player is dragging
//         player_Dragged_Ship = event.target;

//         isShip_Dropped = false;
//     }

//     function onDragOver(event) {
//         /* Allows target container to receive drop events */ 

//         // Override browser default behaviour for elements to allow dropping
//         event.preventDefault();
//     }

//     function onDrop(event) {
//         /* Target cell on which the ships will be placed */ 

//         // Identify which cell the ship will be palced
//         const player_Start_Loc = Number(event.target.id);
//         console.log("start id: " + player_Start_Loc);

//         // Place ship on player's board by first identifying the ship object
//         const shipObj = ship_Arr[Number(player_Dragged_Ship.id)];
        

//         // Player can now place their ships
//         place_Ships_On_Board("Player", shipObj, player_Start_Loc);
        
        
//         // Once the ship has been dropped onto board cell, remove it from the DOM
//         if (!isShip_Dropped) {
//             player_Dragged_Ship.remove();
//         }


//     }

//     const player_Board_Cells = Array.from(document.querySelector('#Player').children);


//     player_Board_Cells.forEach(cell => {
//         cell.addEventListener('dragover', onDragOver);
//         cell.addEventListener('drop', onDrop);
//     })



// });