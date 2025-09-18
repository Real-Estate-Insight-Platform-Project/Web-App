declare module "leaflet.vectorgrid" {
  import * as L from "leaflet"
  namespace L {
    namespace vectorGrid {
      function protobuf(url: string, options?: any): any
      function slicer(data: any, options?: any): any
    }
  }
  export = L
}
