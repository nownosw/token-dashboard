import { FC } from "react"
import { ChakraProvider, Container, Heading } from "@chakra-ui/react"
import { Provider as ReduxProvider } from "react-redux"
import { Web3ReactProvider } from "@web3-react/core"
import theme from "./theme"
import reduxStore from "./store"
import ModalRoot from "./components/Modal"
import getLibrary from "./web3/library"
import Navbar from "./components/Navbar"

const App: FC = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ReduxProvider store={reduxStore}>
        <ChakraProvider theme={theme}>
          <ModalRoot />
          <Navbar />
          <Container maxW="6xl">
            <Heading>Threshold Token Dashboard</Heading>
          </Container>
        </ChakraProvider>
      </ReduxProvider>
    </Web3ReactProvider>
  )
}

export default App
