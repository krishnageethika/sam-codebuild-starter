
# sam-codebuild-starter

A starter template for an AWS SAM project, integrated with CodeBuild for continuous integration.

[SAM](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md) is a fairly generic and unopinionated tool for describing serverless architectures. This starter project seeks to stick to that while easing the design of a Node.js project integrating modern goodness.

This project features support for:

- [AWS SAM CLI](https://github.com/awslabs/aws-sam-cli) for local testing
- [Webpack](https://webpack.js.org) for application packaging
- [Babel](https://babeljs.io) for ES2018 support
- [ESLint](https://eslint.org) for code linting
- [Mocha](https://mochajs.org) for code testing