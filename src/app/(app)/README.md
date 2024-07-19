This Next subgroup (app) is where all the pages and routes for the app that the user sees should go.

See https://nextjs.org/docs/app/building-your-application/routing/route-groups

The reason for the group, is to hold a different layout for the app, so that the, for example, iframe route which allows us to run unsecured JS, can not have access to any of the layout defined here.
