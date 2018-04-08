// $("#tboard td").click(function () {
//     this.setAttribute('class','hit');
// });

let controller = {
    guesses: 0,

    processGuess: function (guess) {
        if(guess.search('^[0-'+(model.boardSize-1)+']{2}$') !== -1){
            this.guesses++;
            let hit = model.fire(guess);
            if (hit && model.shipSunk === model.numShips){
                view.displayMessage('Победа! Вы уничтожили все корабли за '+this.guesses+' выстрелов!');
            }
        }else{
            console.log('Error td id');
        }
    }
};

let view = {
    displayMessage: function (msg) {
        document.getElementById('messageArea').innerHTML=msg;
    },
    displayHit: function (elemID) {
        let elem=document.getElementById(elemID);
        elem.setAttribute('class','hit');
    },
    displayMiss: function (elemid) {
        let elem=document.getElementById(elemid);
        elem.setAttribute('class','miss');
    },
};

let model = {
    boardSize: 7,
    numShips: 5,
    shipLength: 2,
    shipSunk: 0,

    ships: [],
    guessList: [],
    fire: function (guess) {
        if(this.guessList.indexOf(guess) >= 0) return false;
        this.guessList.push(guess);
        for (let i = 0; i < this.numShips; i++) {
            let ship = this.ships[i];
            let index = ship.locations.indexOf(guess);
            if (index >= 0) {
                if(ship.hits[index]) return false;
                ship.hits[index] = true;
                view.displayHit(guess);
                view.displayMessage('Попадание!');
                if (this.isSunk(ship)) {
                    this.shipSunk++;
                    this.markAround(ship.locations);
                    view.displayMessage('Корабль потоплен!!!');
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage('Промах!');
        return false;
    },
    isSunk: function (ship) {
        for (let i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== true) {
                return false;
            }
        }
        return true;
    },
    generateShip: function () {
        let locations = [];
        let startPos = [Math.floor(Math.random() * (this.boardSize - this.shipLength + 1)), Math.floor(Math.random() * (this.boardSize - this.shipLength + 1))];
        if (Math.random() < 0.5)
            for (let i = 0; i < this.shipLength; i++) locations.push(startPos[0].toString() + (startPos[1] + i).toString());
        else
            for (let i = 0; i < this.shipLength; i++) locations.push((startPos[0] + i).toString() + startPos[1].toString());

        return locations;
    },
    generateShipLocations: function () {
        let locations;
        for (let i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            } while (this.collisionShips(locations));

            this.ships.push({locations:locations, hits:[false,false,false]});
        }
    },
    collisionShips(locations) {
        if(this.ships.length===0) return false;

        let around = this.aroundCells(locations);

        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            for (let j = 0; j < around.length; j++) {
                if (ship.locations.indexOf(around[j]) >= 0) return true;
            }
        }
        return false;
    },
    aroundCells: function (locations) {
        let result=[];

        for(let i=0;i<locations.length;i++){
            for(let j=-1;j<=1;j++){
                for(let k=-1;k<=1;k++){
                    let x,y;
                    let calcPos;
                    x=Number(locations[i][0])+j;
                    y=Number(locations[i][1])+k;
                    calcPos=x.toString()+y.toString();

                    if(calcPos.search('^[0-'+(model.boardSize-1)+']{2}$') !== -1)
                        result.push(calcPos);

                }
            }
        }
        return result;
    },
    markAround: function (locations) {
        let aroundCells=this.aroundCells(locations);
        for(let i=0;i<aroundCells.length;i++){
            if(this.guessList.indexOf(aroundCells[i]) < 0) {
                view.displayMiss(aroundCells[i]);
                this.guessList.push(aroundCells[i]);
            }
        }
    }
};
window.onload = function () {
    let tdId;

    tdId = document.querySelectorAll('#tBoard td');
    [].forEach.call(tdId, function(td) {
        td.addEventListener("click", function() {
            controller.processGuess(td.id);
        });
    });
    model.generateShipLocations();
};