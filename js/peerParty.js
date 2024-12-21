class Party{
    constructor(){
        this.members = []
        this.myId = 14
        this.partyElement = document.getElementById('party')
        this.myself = null
    }
    connect(tryId){
        this.myId = tryId
       
        this.myself = new Peer(this.myId)
        let conn = null
        
        this.myself.on('open', (id) => {
            console.log('Connected. My peer ID is: ' + id);
            
            for(let i = 14; i < +this.myId; i++){
                console.log("trying to connect to "+i)
                let conn = this.myself.connect(`${i}`)

                conn.on('open', () => {
                    console.log("Connected to peer "+conn.peer)
                    conn.on('data', function(data) {
                      console.log(conn.peer+': '+ data);
                    });
                    this.members.push[conn]
                });
                conn.on('error', (err) => {
                   console.log(err.type)
                });
            }
        });
        
        this.myself.on('error', (err) => {
            console.log(err.type)
            if (err.type === 'unavailable-id') {
                console.log(`The peer ID ${this.myId} is already in use. Generating new`);
                let memberElement = document.createElement('p')
                memberElement.innerText = this.myId
                this.partyElement.append(memberElement)
                this.connect(+this.myId+1)
            }
            else if (err.type === 'peer-unavailable') {
                console.log('The peer you\'re trying to connect to doesn\'t exist');
            } else {
                console.error('An unexpected error occurred:', err);
            }
        });
        
        this.myself.on('connection', (recievingConn) => {
            console.log("New peer connected: "+recievingConn.peer)
            this.members.push(recievingConn)
            recievingConn.on('data', function(data) {
                console.log(conn.peer+': '+ data);
            });
        });
    }
}

let party = new Party()