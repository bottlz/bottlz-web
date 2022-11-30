import { Box, Button } from "@mui/material";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Box>
      <Button onClick={() => setCount(count + 1)}>{count}</Button>
    </Box>
  );
}

export default App;
