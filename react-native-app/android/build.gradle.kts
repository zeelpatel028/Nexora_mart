plugins {
    id("com.android.application") version "8.5.2" apply false
    id("com.android.library") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
}

extra["compileSdkVersion"] = 34
extra["targetSdkVersion"] = 34
extra["minSdkVersion"] = 24
extra["kotlinVersion"] = "2.0.0"
extra["ndkVersion"] = "26.1.10909125"

allprojects {
    configurations.all {
        resolutionStrategy.dependencySubstitution {
            substitute(module("com.facebook.react:react-native")).using(module("com.facebook.react:react-android:0.75.4"))
        }
    }
    afterEvaluate {
        tasks.withType<JavaCompile>().configureEach {
            sourceCompatibility = "17"
            targetCompatibility = "17"
        }
    }
}

project(":react-native-svg") {
    plugins.withId("com.android.library") {
        configure<com.android.build.gradle.LibraryExtension> {
            sourceSets.getByName("main") {
                java.srcDir("${rootProject.projectDir}/compat/java")
            }
        }
    }
}
