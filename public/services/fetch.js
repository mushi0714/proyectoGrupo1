async function postData(endpoint,obj) {
    try {
      const peticion = await fetch(`http://localhost:2000/${endpoint}`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
      })
    } catch (error) {
        console.error(error);
        
    }
}