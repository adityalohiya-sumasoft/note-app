import React from "react";
import { Auth } from "aws-amplify";
import { useNewUserState } from "../libs/hooksLib";
var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      
      return { ...state, isAuthenticated: true };

   
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("id_token"),
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut,signupUser,confirmCode };

// ###########################################################

async function loginUser(dispatch, login, password, history, setIsLoading, setError) {
  setError(false);
  setIsLoading(true);
  
  if (!!login && !!password) {
    try {
        var response = await Auth.signIn(login, password);
        console.log(response);
        alert("Logged in");
        setTimeout(() => {
            localStorage.setItem("id_token", "1");
            dispatch({ type: "LOGIN_SUCCESS" });
            setError(null);
            setIsLoading(false);
      
            history.push("/app/dashboard");
          }, 2000);
    } catch (e) {
        //alert("InValid Login");
        setError(true);
        setIsLoading(false);
    }
  
    
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}



 async function signupUser(dispatch, login, password,cpassword, history, setIsLoading, setError,setNewUser,confirmCode) {
   
    setError(false);
    setIsLoading(true);
    
    if (!!login && !!password) {
        setIsLoading(true);
       
        try {
          const newUser =  await Auth.signUp({
            username: login,
            password: password
          });
          alert(login);
          alert("User is Created Successfully");
          setIsLoading(false);
          setNewUser(newUser);

        } catch (e) {
          alert(e.message);
          setIsLoading(false);
        }
    
      
    } else {
      dispatch({ type: "LOGIN_FAILURE" });
      setError(true);
      setIsLoading(false);
    }
  }

  async function confirmCode(dispatch, confirmationCode,loginValue,passwordValue, setIsLoading, setError,setNewUser,history) {
   
    setError(false);
    setIsLoading(true);
    
    setIsLoading(true);

    try {
      await Auth.confirmSignUp(loginValue, confirmationCode);
      await Auth.signIn(loginValue,passwordValue);
  
      
      setTimeout(() => {
        alert("Email has Been Confirmed Please Login with Email and Password");
        setError(null);
        setIsLoading(false);
  
        history.push("/app/dashboard");
      }, 2000);
    } catch (e) {
      alert(e.message);
      setIsLoading(false);
    }
  }


function signOut(dispatch, history) {
  localStorage.removeItem("id_token");
  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}

