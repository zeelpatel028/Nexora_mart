pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.10.0"
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("$rootDir/../node_modules/react-native/android")
        }
        maven {
            url = uri("$rootDir/../node_modules/jsc-android/dist")
        }
    }
}

rootProject.name = "NexoraMart"
include(":app")

include(":react-native-screens")
project(":react-native-screens").projectDir = file("$rootDir/../node_modules/react-native-screens/android")

include(":react-native-safe-area-context")
project(":react-native-safe-area-context").projectDir = file("$rootDir/../node_modules/react-native-safe-area-context/android")

include(":react-native-svg")
project(":react-native-svg").projectDir = file("$rootDir/../node_modules/react-native-svg/android")

include(":@react-native-async-storage_async-storage")
project(":@react-native-async-storage_async-storage").projectDir = file("$rootDir/../node_modules/@react-native-async-storage/async-storage/android")

