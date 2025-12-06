export interface ComposeProject {
  name: string;
  file: string;
  services: ComposeService[];
}

export interface ComposeService {
  name: string;
  status: string;
  state: string;
  ports: string[];
}

export interface ComposeOptions {
  detach?: boolean;
  build?: boolean;
  removeOrphans?: boolean;
  forceRecreate?: boolean;
}
