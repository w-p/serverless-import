Mirrored from [Gitlab](https://gitlab.com/will-p/serverless-import).

# Serverless Import
The Serverless Import plug-in provides two features:
- import
- partial

### Import
You can import shared configurations into a `serverless.yml` file just like you'd import a library or package into source code. The imported config is merged with that of the importee. To import a configuration, just declare the top-level key `import`. This can be anywhere in the file but should logically be at the top.

### Partial
Once a configuration has been imported, you can reference specific values under the top-level `partial` key by their object path.

### Example
Below is an illustration of what `serverless-import` does. See also: `./examples`.

```
# shared configuration
provider:
    name: aws
    stage: dev
    region: us-west-2
    runtime: nodejs8.10
    stackName: ${self:service}

partial:
    roles:
    invoke-foo:
      Effect: Allow
      Action:
        - lambda:InvokeFunction
      Resource:
        - arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:foo
```

```
# service file
import: ../shared.yml

service: my-service

provider:
    region: us-east-1

function:
  helloWorld:
    handler: src/helloWorld.handler
    iamRoleStatements:
      - ${partial:roles.invoke-foo}
```

```
# resulting serverless file after resolution of import and partial
service: my-service

provider:
    name: aws
    stage: dev
    region: us-east-1
    runtime: nodejs8.10
    stackName: ${self:service}

function:
  helloWorld:
    handler: src/helloWorld.handler
    iamRoleStatements:
      - Effect: Allow
        Action:
            - lambda:InvokeFunction
        Resource:
            - arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:foo
```