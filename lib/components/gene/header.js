/* @flow */
'use strict'

import React from 'react'
import Relay from 'react-relay'
import { NativeModules, StyleSheet, View, Dimensions } from 'react-native'
const { ARTemporaryAPIModule } = NativeModules

import Events from '../../native_modules/events'

import InvertedButton from '../buttons/inverted_button'
import Headline from '../text/headline'

class Header extends React.Component {
  state: {
    following: ?boolean,
  }

  static propTypes: Object = {
    gene: React.PropTypes.shape({
      name: React.PropTypes.string,
    }),
    shortForm: React.PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.state = { following: null }
  }

  componentDidMount() {
    ARTemporaryAPIModule.followStatusForGene(this.props.gene._id, (error, following) => {
      this.setState({ following: following })
    })
  }


  render() {
    const gene = this.props.gene
    return (
      <View style={{paddingTop: 20}}>
        <Headline style={[styles.base, styles.headline]}>
          {gene.name}
        </Headline>
        {this.renderFollowButton()}
      </View>
    )
  }

  handleFollowChange = () => {
    ARTemporaryAPIModule.setFollowGeneStatus(!this.state.following, this.props.gene._id, (error, following) => {
      if (error) {
        console.error(error)
      } else {
        Events.postEvent(this, {
          name: following ? 'Follow gene' : 'Unfollow gene',
          gene_id: this.props.gene._id,
          gene_slug: this.props.gene.id,
          source_screen: 'gene page',
        })
      }
      this.setState({ following: following })
    })
    this.setState({ following: !this.state.following })
  }

  renderFollowButton() {
    if (this.props.shortForm) { return null }
    if (this.state.following !== null) {
      return (
        <View style={styles.followButton}>
            <InvertedButton text={this.state.following ? 'Following' : 'Follow'}
                            selected={this.state.following}
                            onPress={this.handleFollowChange} />
        </View>
      )
    } else {
      return (
        <View style={styles.followButton}>
          <InvertedButton text="" onPress={this.handleFollowChange} />
        </View>
      )
    }
  }
}


const isPad = Dimensions.get('window').width > 700

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
  },
  headline: {
    fontSize: isPad ? 20 : 14,
  },
  followButton: {
    height: 40,
    marginTop: 30
  }
})

export default Relay.createContainer(Header, {
  fragments: {
    gene: () => Relay.QL`
      fragment on Gene {
        _id
        id
        name
      }
    `,
  }
})
