class Auth {
  
    getCurrentUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:3100/api/v1/auth/get-current-user",
          {
            method: "GET",
            credentials: "include",
          }
        );
  
        const data = await response.json();
  
        if (response.ok) {
          console.log(data)
          return { data, authStatus: true };
        } else {
          return { authStatus: false };
        }
      } catch (err) {
        console.error("An error occurred:", err);
        return { authStatus: false };
      }
    };
  }
  
  const AuthService = new Auth();
  export default AuthService;
  