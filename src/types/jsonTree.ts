
export type PathSegment = string | number

export type JsonModelValue = string | Record<string, any> | any[]

export interface JsonTreeNode {
  key: string
  value?: any
  children?: JsonTreeNode[]
  path: PathSegment[]
  pathKey: string
  isLeaf: boolean
  editing?: boolean
  editBuffer?: string
}