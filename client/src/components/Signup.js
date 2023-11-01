import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Signup = (props) => {

    const [credentials,setCredentials]= useState({name:"",email:"",password:"",cpassword:""}); 
    let navigate= useNavigate();
    
   const handleSubmit = async(e)=>{
    e.preventDefault();
    const {name,email,password}=credentials;
       
    const response = await fetch("http://localhost:5000/api/auth/signup",{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
       },
       body:JSON.stringify({name,email,password})
      }); 
      const json = await response.json();
      console.log(json);
           
      if(json.success){
        //save the auth token and redirect
          localStorage.setItem('token',json.authtoken);
          navigate("/");
          props.showAlert('Successfully created a new account',"success");
      }else{
        props.showAlert('Invalid credentials',"danger");
      }
}

const onChange = (e)=>{
    setCredentials({...credentials,[e.target.name]:e.target.value});
}

  return (

    <div className='mt-3'>
         <h2>Create an account to use iNotes</h2>
       
    <form  onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="name" className="form-label">Username</label>
            <input type="text" className="form-control" id="name" name="name" value={credentials.name} onChange={onChange} aria-describedby="emailHelp"/>
        </div>
        <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" name="email" value={credentials.email} onChange={onChange} aria-describedby="emailHelp"/>
        </div>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={credentials.password} onChange={onChange} id="password" minLength={5} required/>
        </div>
       
        <div className="mb-3">
            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
            <input type="password" className="form-control" name="cpassword" value={credentials.cpassword} onChange={onChange} id="cpassword" minLength={5} required/>
        </div>
       
        <button type="submit" className="btn btn-primary">Submit</button>
    </form>
</div>
  )
}

export default Signup
