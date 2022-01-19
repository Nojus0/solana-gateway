import apiConsumers from "./middlewares/apiMiddleware"
import fullDetailsConsumers from "./middlewares/fullDetailsMiddleware"
import heavyConsumers from "./middlewares/heavyMiddleware"

const middlewares = [heavyConsumers, apiConsumers, fullDetailsConsumers]

export default middlewares
