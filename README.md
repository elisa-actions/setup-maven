### How To Use

Add this step into workflow

```
    - name: Set up Maven
      uses: elisa-actions/setup-maven@v5
      with:
        maven-version: 3.8.2
        mirror: repo.maven.apache.org
```

The optional `mirror` input takes precedence over the `MAVEN_CENTRAL_MIRROR` environment variable. If neither is set, Maven is downloaded from `repo.maven.apache.org`.
