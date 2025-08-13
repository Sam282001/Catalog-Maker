import React from "react";

const AuthFormLayout = ({ title, children, onSubmit }) => {
  return (
    <div className="min-h-screen flex-col app-bg flex items-center justify-center p-4">
      <div className="flex items-center justify-center pb-8">
        <img src="/logo-new.png" alt="logo" className="h-24 w-auto" />
      </div>
      <form className="cool-form-container" onSubmit={onSubmit}>
        <div className="title">{title}</div>
        {children}
      </form>
    </div>
  );
};

export default AuthFormLayout;
