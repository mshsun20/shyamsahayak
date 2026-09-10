import React from 'react'

const defaultWrapperStyle = {
  position: "absolute",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  // minHeight: "100svh",
  flex: 1,
  zIndex: 99999,
}

const Loader = ({ wrapperStyle=null, loaderStyle=null }) => {
  return (
    <div className="loader" style={wrapperStyle!==null ? wrapperStyle : defaultWrapperStyle}>
      <img src="/Eclipse_loader.svg" alt="loader" style={loaderStyle} />
    </div>
  )
}

export default React.memo(Loader)