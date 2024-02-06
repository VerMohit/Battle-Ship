document.addEventListener('DOMContentLoaded', function() {

    // Defining constant parameters for the game
    let ship_Angle = 0;
    const boardCols = 10;
    const boardRows = 10;
    const boardSquares = boardCols * boardRows;
    const game_Container = document.querySelector('.game-container');
    const rotate_Btn = document.querySelector('.rotate');
    const ships_container_Arr = Array.from(document.querySelectorAll('.ships-container div'));
    console.log(ships_container_Arr);
    
    // Functions 
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
            
            cell.appendChild(circle)
            cell.classList.add('cell');
            cell.id = ii;
            gameBoard.appendChild(cell);
        }

        gameBoardCont.appendChild(userTitle);
        gameBoardCont.appendChild(gameBoard);
        game_Container.appendChild(gameBoardCont);
    }

    function rotate(){
        /* Function rotates the ships in the .ships-container */
        ship_Angle = ship_Angle === 0 ? 90 : 0;
        ships_container_Arr.forEach(shipPreview => 
            shipPreview.style.transform=`rotate(${ship_Angle}deg`);
    }


    // Create board
    createBoard('Player');
    createBoard('Computer');    

    // Button logic for flipping ships in the container
    rotate_Btn.addEventListener('click', rotate);

    // Create ship objects to be placed on board
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

    // const ship_Arr = [carrier, battleship, destroyer, submarine, cruiser];
    const ship_Arr = [carrier, battleship];

    
    // Logic for the computer to randomize ship placement
    function compPlaceShips(shipObj) {
        /* Function randomly places ships on the computer board at start of game */

        // Get nodeList of all the children contained in the element with id=Computer
        const compBoardCells = document.querySelector('#Computer').children;
        console.log(shipObj);

        // Get a random start position for the ships (between 0 and 99, inclusive)
        let ship_Start = Math.floor(Math.random() * 100);

        // Randomly determine if the position of the ship will be horizontal (ie. true)
        let is_Horizontal = Math.random() <= 0.5;

        // Determine valid positions for each shipObj based on its orientation and allowable dimensions
        let valid_Start = ship_Start;        // Define initial start lcoation of shipObj
        let last_Ship_Cell;                  // Find the last cell occupied by the shipObj
        let valid_Move = true;              // Identifies if the ship placement was valid
        
        if(is_Horizontal) {
            // Guarentees that the shipObj starting position doesn't exceed last cell (ie. cell with id=99)
            valid_Start = valid_Start > boardSquares - shipObj.length ? boardSquares - shipObj.length : valid_Start;
            // Find the last cell occupied by the shipObj
            last_Ship_Cell = compBoardCells[valid_Start + shipObj.length - 1].id;
            // Ensure that column of the shipObj's start position is less than column of end position
            if(valid_Start % boardCols > last_Ship_Cell % boardCols) {
                valid_Move = false;
            }
        }
        else {
            // Guarentees we never overflow vertically at all (ie. we don't go below the grid)
            valid_Start = valid_Start > boardSquares - (shipObj.length * boardCols) ? valid_Start - (shipObj.length * boardCols) + boardCols : valid_Start;
            // Find the last cell occupied by the shipObj
            last_Ship_Cell = compBoardCells[valid_Start + (shipObj.length - 1) * boardCols].id;
        }

        console.log('first cell ' + ship_Start)
        console.log('last cell ' + last_Ship_Cell)


        
        console.log(valid_Move)

        // Prevent ships from overlapping
        // let cells_Covered;
        // let cell_Not_Taken = true;
        // for(let ii = 0; ii < shipObj.length; ii++) {
        //     cells_Covered = is_Horizontal ? 
        //                                 compBoardCells[valid_Start + ii] : 
        //                                 compBoardCells[valid_Start + (ii * boardCols)];
        //     // cell_Not_Taken = cells_Covered.classList.contains('taken') ? false : true;
        //     if(cells_Covered.classList.contains('taken')) {
        //         cell_Not_Taken = false;
        //         break;
        //     }
        // }


        // Place the ships on computer board and include className 'taken'
        let cells_Covered;
        if (valid_Move ) {
            for(let ii = 0; ii < shipObj.length; ii++) {
                cells_Covered = is_Horizontal ? 
                                            compBoardCells[valid_Start + ii] : 
                                            compBoardCells[valid_Start + (ii * boardCols)];
                
                // Prevent ships from overlapping
                // if(!cells_Covered.className.includes('taken')) {
                    cells_Covered.classList.add(shipObj.name, 'taken');
                // }
                // else {
                //     compPlaceShips(shipObj);
                // }


                
            }
            // console.log('last cell ' + cells_Covered.className.includes('taken'))
            return;
        }
        else {
            compPlaceShips(shipObj);
        }

        
    
    }

    // Initialize computer ship piece placement
    ship_Arr.forEach(shipObj => compPlaceShips(shipObj));





});