import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Dimensions, ImageBackground, Text, TouchableOpacity, View} from 'react-native'
import _ from 'lodash'
import {Image} from 'react-native-expo-image-cache'
import emptyImg from './empty-image.png'
import {Video} from "expo-av";
import loading from './loading.gif'

const {width} = Dimensions.get('window')

const isVideo = (photo) => {
  return photo.mediaType === 'video'
      || photo.type === 'video'
}
const isPhotoType = (photo) => {
  return photo.mediaType === 'photo'
      || photo.type === 'image'
      || photo.type === 'photo'
}
const getRefVideo = () => {
  let result = []
  for (let i = 0; i < 5; i++) {
    result.push(React.createRef(null))
  }
  return result
}
class MediaGrid extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      width: props.width,
      height: props.height,
      initialStatus: {
        shouldPlay: true,
        rate: 1.0,
        volume: 1.0,
        isMuted: true,
        isLooping: false,
        progressUpdateIntervalMillis: 1000
      }
    }
  }

  videoRefs = getRefVideo()
  static defaultProps = {
    numberImagesToShow: 0,
    onPressImage: () => {
    },
  }

  isLastImage = (index, secondViewImages) => {
    const {source, numberImagesToShow} = this.props

    return (source.length > 5 || numberImagesToShow) && index === secondViewImages.length - 1
  }

  handlePressImage = (event, {image, index}, secondViewImages) =>
      this.props.onPressImage(event, image, {
        isLastImage: index && this.isLastImage(index, secondViewImages),
      })

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.playing !== this.props.playing) {
      if (this.props.playing) {
        const {source} = this.props
        const files = _.take(source, 5)
        this.videoRefs.forEach(async (ref, idx) => {
          if (files[idx] && isVideo(files[idx])) {
            if (ref && ref.current) {
              try {
                await ref.current.unloadAsync()
              } catch (e) {
                console.log(e);
              }
              try {
                console.log('try load uri', idx, files[idx].uri)
                const status = await ref.current.loadAsync({uri: files[idx].uri}, this.state.initialStatus)
                console.log(status)
              } catch (e) {
                console.log(e);
              }

            }

          } else {
            if (ref && ref.current) {
              try {
                await ref.current.unloadAsync()
              } catch (e) {

              }
            }
          }
        })
      } else {
        this.videoRefs.forEach(ref => {
          if (ref && ref.current) {
            try {
              ref.current.unloadAsync()
            } catch (e) {

            }
          }
        })
      }
    }
  }

  _mountVideo = index => async (ref) => {
    this.videoRefs[index].current = ref
  }

  componentWillUnmount() {
    this.videoRefs.forEach(ref => {
      if (ref && ref.current) {
        try {
          console.log('unmounted ')
          ref.current.unloadAsync()
        } catch (e) {

        }
      }
    })
  }

  render() {
    const {imageProps, photosOnly, source: _source, playing, videoRefs} = this.props
    const photos = _source.filter(m => isPhotoType(m)) || []
    const source = _.take(photosOnly ? photos : _source, 5)
    const firstViewImages = []
    const secondViewImages = []
    const firstItemCount = source.length === 5 ? 2 : 1
    let index = 0
    _.each(source, (img, callback) => {
      if (index === 0) {
        firstViewImages.push(img)
      } else if (index === 1 && firstItemCount === 2) {
        firstViewImages.push(img)
      } else {
        secondViewImages.push(img)
      }
      index++
    })

    const {width, height} = this.props
    let ratio = 0
    if (secondViewImages.length === 0) {
      ratio = 0
    } else if (secondViewImages.length === 1) {
      ratio = 1 / 2
    } else {
      ratio = this.props.ratio
    }
    const direction = source.length === 5 ? 'row' : 'column'

    const firstImageWidth = direction === 'column' ? (width / firstViewImages.length) : (width * (1 - ratio))
    const firstImageHeight = direction === 'column' ? (height * (1 - ratio)) : (height / firstViewImages.length)

    const secondImageWidth = direction === 'column' ? (width / secondViewImages.length) : (width * ratio)
    const secondImageHeight = direction === 'column' ? (height / secondViewImages.length) : (height * ratio)

    const secondViewWidth = direction === 'column' ? width : (width * ratio)
    const secondViewHeight = direction === 'column' ? (height * ratio) : height

    return source.length ? (
        <View style={[{flexDirection: direction, width, height}, this.props.styles]}>
          <View style={{flex: 1, flexDirection: direction === 'row' ? 'column' : 'row'}}>
            {firstViewImages.map((image, index) => (
                <TouchableOpacity activeOpacity={0.7} key={index} style={{flex: 1}}
                                  onPress={event => this.handlePressImage(event, {image})}>
                  {
                    (!photosOnly && isVideo(image) && playing) ? (
                            <Video
                                // source={typeof image === 'string' ? { uri: image } : image}
                                rate={1.0}
                                volume={1.0}
                                isMuted={true}
                                resizeMode="cover"
                                shouldPlay
                                isLooping
                                posterSource={loading}
                                posterStyle={{
                                  width: firstImageWidth,
                                  height: firstImageHeight
                                }}
                                style={[styles.image, {
                                  width: firstImageWidth,
                                  height: firstImageHeight
                                }, this.props.imageStyle]}
                                onError={async error => {
                                  console.log(error)
                                }}
                                {...this.props.videoSettings}
                                ref={this._mountVideo(index)}
                            />
                        )
                        :
                        <Image
                            style={[styles.image, {
                              width: firstImageWidth,
                              height: firstImageHeight
                            }, this.props.imageStyle]}
                            // source={typeof image === 'string' ? { uri: image } : image}
                            defaultSource={this.props.emptyImage || emptyImg}
                            uri={typeof image === 'string' ? image : image.thumbnail ? image.thumbnail : image.uri}
                            {...imageProps}
                        />

                  }

                </TouchableOpacity>
            ))}
          </View>
          {
            secondViewImages.length ? (
                <View style={{
                  width: secondViewWidth,
                  height: secondViewHeight,
                  flexDirection: direction === 'row' ? 'column' : 'row'
                }}>
                  {secondViewImages.map((image, index) => (
                      <TouchableOpacity activeOpacity={0.7} key={index} style={{flex: 1}}
                                        onPress={event => this.handlePressImage(event, {
                                          image,
                                          index
                                        }, secondViewImages)}>
                        {this.isLastImage(index, secondViewImages) ?
                            (
                                // isVideo(image) ?
                                //   <Video
                                //     source={typeof image === 'string' ? { uri: image } : image}
                                //     rate={1.0}
                                //     volume={1.0}
                                //     isMuted={true}
                                //     resizeMode="cover"
                                //     shouldPlay
                                //     isLooping
                                //     style={[styles.image, {
                                //       width: secondImageWidth,
                                //       height: secondImageHeight
                                //     }, this.props.imageStyle]}
                                //     {...this.props.videoSettings}
                                //   />
                                //   :

                                <ImageBackground
                                    style={[styles.image, {
                                      width: secondImageWidth,
                                      height: secondImageHeight
                                    }, this.props.imageStyle]}
                                    source={typeof image === 'string' ? {uri: image} : image.thumbnail ? {uri: image.thumbnail} : image}
                                >
                                  <View style={styles.lastWrapper}>
                                    <Text
                                        style={[styles.textCount, this.props.textStyles]}>+{this.props.numberImagesToShow || this.props.source.length - 5}</Text>
                                  </View>
                                </ImageBackground>

                            )
                            :
                            isVideo(image) && playing ?
                                <Video
                                    // source={typeof image === 'string' ? { uri: image } : image}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={true}
                                    resizeMode="cover"
                                    shouldPlay
                                    isLooping
                                    posterSource={loading}
                                    posterStyle={{
                                      width: secondImageWidth,
                                      height: secondImageHeight
                                    }}
                                    style={[styles.image, {
                                      width: secondImageWidth,
                                      height: secondImageHeight
                                    }, this.props.imageStyle]}
                                    {...this.props.videoSettings}
                                    onError={async error => {
                                      console.log(error)
                                    }}
                                    ref={this._mountVideo(firstViewImages.length + index)}
                                />
                                :
                                <Image
                                    style={[styles.image, {
                                      width: secondImageWidth,
                                      height: secondImageHeight
                                    }, this.props.imageStyle]}
                                    // source={typeof image === 'string' ? { uri: image } : image}
                                    defaultSource={this.props.emptyImage || emptyImg}
                                    uri={typeof image === 'string' ? image : image.thumbnail ? image.thumbnail : image.uri}
                                    {...imageProps}
                                />

                        }
                      </TouchableOpacity>
                  ))}
                </View>
            ) : null
          }
        </View>
    ) : null
  }
}

MediaGrid.prototypes = {
  source: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
  imageStyle: PropTypes.object,
  onPressImage: PropTypes.func,
  ratio: PropTypes.float,
  imageProps: PropTypes.object
}

MediaGrid.defaultProps = {
  style: {},
  imageStyle: {},
  imageProps: {},
  width: width,
  height: 400,
  ratio: 1 / 3
}

const styles = {
  image: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#fff'
  },
  lastWrapper: {
    flex: 1,
    backgroundColor: 'rgba(200, 200, 200, .5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textCount: {
    color: '#fff',
    fontSize: 60
  }
}

export default MediaGrid
