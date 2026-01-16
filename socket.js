let users= new Map()
export const mainSocket =(io)=>{
     io.on('connection',(socket)=>{
        console.log('new connection established',socket.id)
        socket.on('newUser',(userId)=>{
           users.set(userId,socket.id)
        })

        socket.on('sendMessage',(ans)=>{
            if(users.has(ans.profileId)){
              const profileSocketId= users.get(ans.profileId)
              if(profileSocketId){
                socket.to(profileSocketId).emit('replyMessage',ans.text)
              }
            }
            else{
                console.log('Profile Id not exists, it means other person is not online')
            }
        })
     })

}
